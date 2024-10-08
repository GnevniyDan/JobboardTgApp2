from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# Database setup
def init_db():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            link TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Endpoint to get all job listings
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM jobs')
    rows = cursor.fetchall()
    conn.close()
    jobs = [{'id': row[0], 'title': row[1], 'description': row[2], 'link': row[3]} for row in rows]
    return jsonify(jobs)

# Endpoint to add a new job listing
@app.route('/api/jobs', methods=['POST'])
def add_job():
    new_job = request.get_json()
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO jobs (title, description, link) VALUES (?, ?, ?)',
                   (new_job['title'], new_job['description'], new_job['link']))
    conn.commit()
    new_job_id = cursor.lastrowid
    conn.close()
    new_job['id'] = new_job_id
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
    job = {'id': row[0], 'title': row[1], 'description': row[2], 'link': row[3]}
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

if __name__ == '__main__':
    app.run(debug=True)