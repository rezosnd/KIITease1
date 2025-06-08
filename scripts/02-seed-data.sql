-- Insert sample teachers
INSERT INTO teachers (name, department) VALUES
('Dr. John Smith', 'CSE'),
('Prof. Sarah Johnson', 'ECE'),
('Dr. Michael Brown', 'ME'),
('Prof. Emily Davis', 'CE'),
('Dr. Robert Wilson', 'EE'),
('Prof. Lisa Anderson', 'IT'),
('Dr. David Miller', 'CSE'),
('Prof. Jennifer Taylor', 'ECE');

-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password_hash, branch, year, role, referral_code) VALUES
('Admin User', 'admin@edu.com', '$2b$10$rQZ8kHWfQxwjQxwjQxwjQOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'CSE', 4, 'admin', 'ADMIN001');
