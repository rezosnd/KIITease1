-- Add password reset fields to users table
-- Note: In MongoDB, we don't need to run this as a separate migration
-- The fields will be added when we update documents

-- This is just for documentation of the new fields:
-- resetPasswordToken: String (hashed token)
-- resetPasswordExpiry: Date (expiration time)

-- Example MongoDB update to add these fields to existing users:
-- db.users.updateMany(
--   {},
--   {
--     $set: {
--       resetPasswordToken: null,
--       resetPasswordExpiry: null
--     }
--   }
-- )
