# Supabase Email Templates

## Confirm Sign Up Email Template

Paste this into the **Body** section of the "Confirm sign up" email template in Supabase:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

Or if you want a more detailed template:

```html
<h2>Welcome to GroupNest!</h2>

<p>Thanks for signing up! Please confirm your email address by clicking the link below:</p>

<p><a href="{{ .ConfirmationURL }}">Confirm Email Address</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't create an account, you can safely ignore this email.</p>

<p>Thanks,<br>The GroupNest Team</p>
```

## Subject Line

The subject should be:
```
Confirm Your Signup
```

## How to Use

1. In Supabase dashboard, go to **Authentication** → **Email Templates**
2. Click on **"Confirm sign up"**
3. Make sure **"Source"** tab is selected
4. Paste the HTML code above into the Body field
5. Click **Save**

## Available Variables

You can use these variables in your template:
- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .Token }}` - The confirmation token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address
- `{{ .Data }}` - Additional user data
- `{{ .RedirectTo }}` - Redirect URL after confirmation








