-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  branch VARCHAR(10) NOT NULL CHECK (branch IN ('CSE', 'ECE', 'ME', 'CE', 'EE', 'IT')),
  year INTEGER NOT NULL CHECK (year IN (1, 2, 3, 4)),
  role VARCHAR(10) DEFAULT 'free' CHECK (role IN ('free', 'paid', 'admin')),
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_by UUID REFERENCES users(id),
  payment_id VARCHAR(255),
  payment_amount DECIMAL(10,2),
  payment_date TIMESTAMP,
  refund_eligible BOOLEAN DEFAULT FALSE,
  refund_status VARCHAR(20) DEFAULT 'none' CHECK (refund_status IN ('none', 'eligible', 'pending', 'issued')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create teachers table
CREATE TABLE teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  branch VARCHAR(10) NOT NULL,
  year INTEGER NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  teacher_id UUID REFERENCES teachers(id) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  branch VARCHAR(10) NOT NULL,
  year INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 2 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES users(id) NOT NULL,
  referred_id UUID REFERENCES users(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create ai_analytics table
CREATE TABLE ai_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_notes_branch_year ON notes(branch, year);
CREATE INDEX idx_reviews_teacher_id ON reviews(teacher_id);
CREATE INDEX idx_reviews_branch_year ON reviews(branch, year);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
