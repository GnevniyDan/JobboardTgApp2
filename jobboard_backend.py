from flask import Flask, request, jsonify, send_from_directory, redirect
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'static/logos'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Database setup
def init_db():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            link TEXT NOT NULL,
            level TEXT,
            type TEXT,
            logo TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Redirect root to jobboard interface
@app.route('/')
def redirect_to_interface():
    return redirect('/jobboard_interface.html', code=302)

# Endpoint to get all job listings
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM jobs')
    rows = cursor.fetchall()
    conn.close()
    jobs = [
        {
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'link': row[3],
            'level': row[4],
            'type': row[5],
            'logo': row[6] if row[6] else None
        } for row in rows
    ]
    return jsonify(jobs)

# Endpoint to add a new job listing
@app.route('/api/jobs', methods=['POST'])
def add_job():
    title = request.form.get('title')
    description = request.form.get('description')
    link = request.form.get('link')
    level = request.form.get('level')
    job_type = request.form.get('type')
    logo = request.files.get('logo')

    logo_filename = None
    if logo:
        logo_filename = logo.filename
        logo.save(os.path.join(app.config['UPLOAD_FOLDER'], logo_filename))

    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO jobs (title, description, link, level, type, logo) VALUES (?, ?, ?, ?, ?, ?)',
                   (title, description, link, level, job_type, logo_filename))
    conn.commit()
    new_job_id = cursor.lastrowid
    conn.close()

    new_job = {
        'id': new_job_id,
        'title': title,
        'description': description,
        'link': link,
        'level': level,
        'type': job_type,
        'logo': f'/logos/{logo_filename}' if logo_filename else None
    }
    return jsonify(new_job), 201

# Endpoint to get a specific job by id
@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM jobs WHERE id = ?', (job_id,))
    row = cursor.fetchone()
    conn.close()
    if row is None:
        return jsonify({'error': 'Job not found'}), 404
    job = {
        'id': row[0],
        'title': row[1],
        'description': row[2],
        'link': row[3],
        'level': row[4],
        'type': row[5],
        'logo': row[6] if row[6] else None
    }
    return jsonify(job)

# Endpoint to delete a job listing
@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM jobs WHERE id = ?', (job_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Job deleted'}), 200

# Endpoint to serve logo files
@app.route('/logos/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Serve jobboard interface html
@app.route('/jobboard_interface.html')
def serve_interface():
    return send_from_directory('.', 'Jobboard_interface.html')

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
