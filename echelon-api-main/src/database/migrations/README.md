# Database Migrations

This directory contains database migrations for the Echelon API.

## User RPC Functions

The `user-rpc-functions.sql` file contains RPC functions that replace direct schema access in the `UsersRepository`. This refactoring provides several benefits:

1. **Centralized Database Logic**: All database access logic is centralized in database functions rather than spread throughout the application code.
2. **Improved Security**: Functions can be defined with `SECURITY DEFINER` to run with the privileges of the function owner.
3. **Better Performance**: Database functions can be optimized for specific queries.
4. **Reduced Network Traffic**: Less data is transferred between the application and database.
5. **Easier Maintenance**: Changes to database schema require updates in fewer places.

### How to Apply

To apply these migrations, run the following command:

```bash
psql -U your_username -d your_database -f src/database/migrations/user-rpc-functions.sql
```

Or using Supabase CLI:

```bash
supabase db diff -f user-rpc-functions
supabase db push
```

## Function Details

### Public Schema Functions

1. `get_user_profile(user_id_param UUID)`: Retrieves user profile data by user ID
2. `insert_confirmation_email_sso(user_id_param UUID, email_expiraded_at_param TIMESTAMPTZ)`: Inserts confirmation email for SSO users
3. `insert_user_profile(user_id_param UUID, first_name_param TEXT, last_name_param TEXT, user_case_team_id_param UUID, access_id_param UUID)`: Inserts user profile data

### Auth Schema Functions

1. `get_user_auth_data(user_id_param UUID)`: Retrieves user auth data by user ID
2. `verify_email_no_sso(email_param TEXT)`: Verifies if a non-SSO user exists with the given email
3. `verify_email(email_param TEXT)`: Verifies if any user exists with the given email
4. `delete_user_by_email(email_param TEXT)`: Deletes a user by email
5. `update_user(user_id_param UUID, user_data JSONB)`: Updates a user 