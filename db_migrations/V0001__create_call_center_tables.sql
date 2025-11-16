
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'operator')),
    status VARCHAR(50) NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'break')),
    phone_extension VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    caller_number VARCHAR(50) NOT NULL,
    operator_id INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'completed', 'missed', 'queued')),
    duration INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    company VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS call_queue (
    id SERIAL PRIMARY KEY,
    caller_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'assigned', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, full_name, role, status, phone_extension) 
VALUES 
    ('123', '123', 'Супер Администратор', 'super_admin', 'online', '1000'),
    ('ivanov', 'pass123', 'Иванов Иван Иванович', 'operator', 'online', '1001'),
    ('sidorova', 'pass123', 'Сидорова Анна Сергеевна', 'operator', 'online', '1002'),
    ('smirnov', 'pass123', 'Смирнов Петр Константинович', 'operator', 'offline', '1003'),
    ('kuznetsova', 'pass123', 'Кузнецова Мария Викторовна', 'operator', 'online', '1004'),
    ('petrov', 'pass123', 'Петров Дмитрий Николаевич', 'operator', 'online', '1005')
ON CONFLICT (username) DO NOTHING;

INSERT INTO clients (name, phone, email, company, notes)
VALUES
    ('ООО "Рога и Копыта"', '+7 (495) 123-45-67', 'info@rogakopyta.ru', 'ООО "Рога и Копыта"', 'Постоянный клиент'),
    ('ИП Петров', '+7 (495) 234-56-78', 'petrov@mail.ru', 'ИП Петров', 'Новый клиент'),
    ('ЗАО "Технологии"', '+7 (495) 345-67-89', 'tech@tech.ru', 'ЗАО "Технологии"', 'VIP клиент'),
    ('ООО "Инновации"', '+7 (495) 456-78-90', 'info@innov.ru', 'ООО "Инновации"', 'Средний клиент')
ON CONFLICT DO NOTHING;
