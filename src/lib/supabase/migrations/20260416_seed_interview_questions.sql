-- Seed Interview Question Bank with high-quality CSE-targeted questions

INSERT INTO interview_question_bank (company, role, year, topic, question, expected_answer_points, difficulty, source_type, is_verified)
VALUES
-- TCS (Technical)
('TCS', 'BTech CSE Campus Placement', 2024, 'Java', 'What is the difference between abstraction and encapsulation with real-world examples?', '["Abstraction hides detail, encapsulation hides data", "Abstraction uses interface/abstract class", "Encapsulation uses private modifiers"]', 'Easy', 'Curated', true),
('TCS', 'BTech CSE Campus Placement', 2023, 'DBMS', 'What are ACID properties in a database? Explain why they are important for banking transactions.', '["Atomicity, Consistency, Isolation, Durability", "Ensures data integrity during failures"]', 'Easy', 'Curated', true),

-- Amazon (Technical)
('Amazon', 'Software Engineer', 2024, 'DSA', 'Explain the Time and Space Complexity of QuickSort. What is its worst-case scenario and how can we avoid it?', '["O(n log n) average, O(n^2) worst", "Worst case happens when pivot is smallest/largest", "Randomized pivot avoids worst case"]', 'Hard', 'Curated', true),
('Amazon', 'Backend Developer', 2025, 'System Design', 'How would you design a URL shortening service like Bitly? What database would you use?', '["Hashing algorithm", "NoSQL vs RDBMS trade-offs", "Caching for high read speed"]', 'Hard', 'Trend-based', false),

-- Google (Technical)
('Google', 'Full Stack Developer', 2024, 'Javascript', 'Explain the event loop in JavaScript. How does it handle asynchronous operations?', '["Call stack, Web APIs, Task queue", "Microtasks vs Macrotasks", "Non-blocking I/O"]', 'Hard', 'Curated', true),

-- Infosys (Technical)
('Infosys', 'Java Developer', 2023, 'Java', 'What are the main features of Java 8 that changed the way we write code?', '["Lambda expressions", "Streams API", "Optional class", "Default methods"]', 'Medium', 'Curated', true),

-- Generic HR / Behavioral
('Generic', 'BTech CSE Campus Placement', 2025, 'HR', 'Tell me about a time you worked in a team and faced a conflict. How did you resolve it?', '["STAR method (Situation, Task, Action, Result)", "Focus on communication and resolution"]', 'Easy', 'Trend-based', true),
('Generic', 'BTech CSE Campus Placement', 2025, 'HR', 'Why do you want to join our company specifically, and where do you see yourself in 5 years?', '["Growth mindset", "Company vision alignment", "Skill acquisition"]', 'Easy', 'Trend-based', true),

-- Accenture (Technical)
('Accenture', 'Data Analyst', 2024, 'SQL', 'What is the difference between WHERE and HAVING clauses in SQL? Give an example using GROUP BY.', '["WHERE filters rows before aggregation", "HAVING filters groups after aggregation"]', 'Medium', 'Curated', true),

-- Wipro (Technical)
('Wipro', 'Python Developer', 2024, 'Python', 'What is the difference between a list and a tuple in Python? When would you prefer one over the other?', '["Lists are mutable, tuples are immutable", "Tuples are faster for iteration", "Safe data storage in tuples"]', 'Easy', 'Curated', true);
