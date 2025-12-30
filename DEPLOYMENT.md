# 🚀 Deployment Guide - CourseHub

This guide will help you deploy the CourseHub application with the **frontend on Vercel** and **backend on Render**.

---

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Render account (sign up at [render.com](https://render.com))
- Git installed locally

---

## 🔧 Part 1: Backend Deployment (Render)

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit - CourseHub"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy on Render

1. **Login to Render** at [dashboard.render.com](https://dashboard.render.com)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the CourseHub repository

3. **Configure the Service**
   - **Name**: `coursehub-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     cd backend && pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
     ```
   - **Start Command**: 
     ```bash
     cd backend && gunicorn backend.wsgi:application
     ```

4. **Add Environment Variables**
   Click "Environment" and add:
   
   ```
   DJANGO_SECRET_KEY=<generate-a-strong-random-key>
   DJANGO_DEBUG=false
   DJANGO_ALLOWED_HOSTS=.onrender.com
   FRONTEND_URL=https://your-app.vercel.app
   BACKEND_URL=https://your-app.onrender.com
   PYTHON_VERSION=3.11.0
   ```

   **Generate Secret Key**: Run this in Python:
   ```python
   import secrets
   print(secrets.token_urlsafe(50))
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes for first deploy)
   - Note your backend URL: `https://your-app.onrender.com`

### Step 3: Create Superuser (Admin Account)

After deployment succeeds:

1. Go to your Render dashboard
2. Click on your web service
3. Click "Shell" tab
4. Run these commands:
   ```bash
   cd backend
   python manage.py createsuperuser
   ```
5. Follow prompts to create admin account

---

## 🎨 Part 2: Frontend Deployment (Vercel)

### Step 1: Create Environment File

Create `.env` file in the root directory:

```env
VITE_API_URL=https://your-app.onrender.com/api
```

**Important**: Replace `your-app.onrender.com` with your actual Render URL from Part 1.

### Step 2: Deploy on Vercel

1. **Login to Vercel** at [vercel.com](https://vercel.com)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-app.onrender.com/api`
   - Replace with your actual Render backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Note your frontend URL: `https://your-app.vercel.app`

### Step 3: Update Backend CORS Settings

Go back to **Render Dashboard**:

1. Click on your backend service
2. Go to "Environment" tab
3. Update these variables with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   DJANGO_ALLOWED_HOSTS=.onrender.com,your-app.vercel.app
   ```
4. Click "Save Changes"
5. Service will auto-redeploy

---

## ✅ Part 3: Verification

### Test Backend API

1. Visit: `https://your-app.onrender.com/api/courses/`
2. Should see JSON response (empty array `[]` if no courses)
3. Visit: `https://your-app.onrender.com/admin/`
4. Login with superuser credentials

### Test Frontend

1. Visit: `https://your-app.vercel.app`
2. Should see the CourseHub homepage
3. Try logging in with your superuser account
4. Test creating a course

### Test Integration

1. Create a course from admin panel
2. Verify it appears on the frontend
3. Test student registration
4. Test certificate generation

---

## 🔐 Security Checklist

- ✅ Set `DJANGO_DEBUG=false` in production
- ✅ Use strong `DJANGO_SECRET_KEY`
- ✅ HTTPS enabled (automatic on Vercel & Render)
- ✅ CORS configured correctly
- ✅ `.env` files added to `.gitignore`
- ✅ Database credentials secure (SQLite on Render's disk)

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: 500 Server Error
- Check Render logs: Dashboard → Your Service → Logs
- Verify environment variables are set correctly
- Ensure migrations ran successfully

**Issue**: CORS errors
- Verify `FRONTEND_URL` matches your Vercel deployment
- Check `CSRF_TRUSTED_ORIGINS` includes Vercel URL
- Ensure `CORS_ALLOW_CREDENTIALS = True`

### Frontend Issues

**Issue**: API calls failing
- Check `VITE_API_URL` environment variable on Vercel
- Verify backend URL is accessible
- Check browser console for errors

**Issue**: Build fails
- Check Node version (should be 16+)
- Verify all dependencies in `package.json`
- Check Vercel build logs

### Database Issues

**Issue**: Database not persisting on Render free tier
- Render free tier restarts daily, which resets the SQLite database
- **Solution**: Upgrade to paid tier OR use PostgreSQL (see below)

---

## 📊 Using PostgreSQL (Recommended for Production)

Render's free tier SQLite resets daily. For production:

### 1. Create PostgreSQL Database on Render

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Name: `coursehub-db`
4. Plan: Free tier available
5. Click "Create Database"
6. Copy the "Internal Database URL"

### 2. Update Django Settings

Add to `backend/requirements.txt`:
```
psycopg2-binary>=2.9,<3.0
dj-database-url>=2.0,<3.0
```

Update `backend/backend/settings.py`:
```python
import dj_database_url

# Replace DATABASES section with:
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
}
```

### 3. Add Environment Variable on Render

- Key: `DATABASE_URL`
- Value: Your PostgreSQL Internal Database URL from step 1

### 4. Redeploy

Backend will auto-redeploy and use PostgreSQL.

---

## 🔄 Updates and Redeployment

### Update Backend

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push
   ```
3. Render auto-deploys from `main` branch

### Update Frontend

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push
   ```
3. Vercel auto-deploys from `main` branch

---

## 📝 Environment Variables Summary

### Backend (Render)
```
DJANGO_SECRET_KEY=<random-50-char-string>
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=.onrender.com,your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-app.onrender.com
PYTHON_VERSION=3.11.0
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-app.onrender.com/api
```

---

## 🎉 Post-Deployment

1. **Create Demo Accounts**
   - Admin, Teacher, and Student accounts for testing

2. **Add Sample Courses**
   - Create courses via admin panel

3. **Test All Features**
   - Authentication
   - Course creation
   - Certificate generation
   - Certificate verification

4. **Monitor Performance**
   - Check Render logs for errors
   - Monitor Vercel analytics

---

## 💡 Tips

- **Free Tier Limitations**:
  - Render: Service sleeps after 15 min inactivity (slow first request)
  - Render: SQLite resets daily (use PostgreSQL)
  - Both: Limited bandwidth/requests

- **Speed Up Cold Starts**:
  - Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 5 minutes

- **Custom Domain**:
  - Both Vercel and Render support custom domains
  - Add domain in respective dashboards
  - Update environment variables with new domain

---

## 📞 Support

If you encounter issues:
- Check deployment logs on Render/Vercel
- Review this guide's troubleshooting section
- Verify all environment variables are correct
- Ensure latest code is pushed to GitHub

---

**Congratulations! Your CourseHub is now live! 🎓**

Frontend: `https://your-app.vercel.app`  
Backend: `https://your-app.onrender.com`  
Admin: `https://your-app.onrender.com/admin`
