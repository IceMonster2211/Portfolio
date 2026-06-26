import re
import secrets
import time
from flask import Flask, render_template, request, redirect, url_for, session, abort
from config import Config
from models import db, Contact
from flask_talisman import Talisman

app = Flask(__name__)
app.config.from_object(Config)

# Content Security Policy: whitelist trusted sources for resources
csp = {
    'default-src': '\'self\'',
    'font-src': [
        '\'self\'',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cdnjs.cloudflare.com'
    ],
    'style-src': [
        '\'self\'',
        'fonts.googleapis.com',
        'cdnjs.cloudflare.com',
        '\'unsafe-inline\''
    ],
    'img-src': [
        '\'self\'',
        'avatars.githubusercontent.com',
        'data:'
    ],
    'script-src': [
        '\'self\'',
        '\'unsafe-inline\''
    ]
}

# Protect headers and enforce HTTPS (except in local debug mode)
Talisman(app, content_security_policy=csp, force_https=not app.debug)

# Initialize database with the app
db.init_app(app)

# Create database tables if they do not exist
with app.app_context():
    db.create_all()

# Simple email regex pattern for basic validation
EMAIL_REGEX = re.compile(r'^[\w\.-]+@[\w\.-]+\.\w+$')

# Security: Generate CSRF token for each session
@app.before_request
def ensure_csrf_token():
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/contact', methods=['POST'])
def contact():
    # 1. CSRF Token Validation
    csrf_token = request.form.get('csrf_token')
    if not csrf_token or csrf_token != session.get('csrf_token'):
        abort(403, description="CSRF token validation failed.")

    # 2. Anti-Spam Honeypot Field Check (bots will fill this hidden field)
    honeypot = request.form.get('website', '').strip()
    if honeypot:
        # Silently reject bot submissions
        return redirect(url_for('home', _anchor='contact'))

    # 3. Rate Limiting (10-second cooldown per submission)
    last_submit = session.get('last_submit_time')
    current_time = time.time()
    if last_submit and (current_time - last_submit < 10):
        # Prevent rapid submit spamming
        return redirect(url_for('home', _anchor='contact'))

    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    message = request.form.get('message', '').strip()
    
    # 4. Input Length & Validity Checks
    if not name or not email or not message:
        return redirect(url_for('home', _anchor='contact'))
        
    if len(name) > 100 or len(email) > 120 or len(message) > 5000:
        # Block database field size overflow attempts
        return redirect(url_for('home', _anchor='contact'))
        
    if not EMAIL_REGEX.match(email):
        return redirect(url_for('home', _anchor='contact'))
        
    try:
        # Create and save the contact form submission (SQLAlchemy ORM automatically parameterizes SQL to prevent SQL Injection)
        new_contact = Contact(name=name, email=email, message=message)
        db.session.add(new_contact)
        db.session.commit()
        # Save timestamp of successful submission
        session['last_submit_time'] = current_time
    except Exception as e:
        db.session.rollback()
        # Fallback to homepage redirect on database error
        return redirect(url_for('home', _anchor='contact'))
        
    return render_template('thank_you.html')

if __name__ == '__main__':
    app.run(debug=True)