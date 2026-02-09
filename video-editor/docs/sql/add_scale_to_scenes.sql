-- SQL query to add 'scale' column to the scenes table
ALTER TABLE scenes ADD COLUMN scale NUMERIC DEFAULT 1.0;

-- Optional: Add a comment explaining the column
COMMENT ON COLUMN scenes.scale IS 'The video scale/framing for the scene (for Heygen, typically 1.0 to 2.0).';
