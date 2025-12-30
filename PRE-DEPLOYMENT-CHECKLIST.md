# 📋 Pre-Deployment Checklist

Use this checklist before deploying to production.

## ✅ Code & Configuration

- [ ] All environment variables configured (see `.env.example` files)
- [ ] `.gitignore` file includes all sensitive data
- [ ] `DJANGO_DEBUG=false` for production
- [ ] Strong `DJANGO_SECRET_KEY` generated
- [ ] `requirements.txt` includes `whitenoise` and `gunicorn`
- [ ] CORS origins configured with production URLs
- [ ] CSRF trusted origins configured

## ✅ Database

- [ ] Database migrations created and applied
- [ ] Sample data tested locally
- [ ] Superuser account created
- [ ] Database backup strategy planned

## ✅ Static Files

- [ ] `python manage.py collectstatic` runs successfully
- [ ] WhiteNoise configured in settings
- [ ] Static files served correctly

## ✅ Security

- [ ] No secrets in code (use environment variables)
- [ ] HTTPS enforced in production
- [ ] Session cookies secure
- [ ] ALLOWED_HOSTS configured
- [ ] Security headers configured

## ✅ Testing

- [ ] All API endpoints tested
- [ ] Authentication flow works
- [ ] Certificate generation tested
- [ ] Certificate verification tested
- [ ] File uploads working
- [ ] Error pages display correctly

## ✅ Frontend

- [ ] Build completes without errors (`npm run build`)
- [ ] Environment variables configured
- [ ] API URL points to production backend
- [ ] All routes accessible
- [ ] Mobile responsive

## ✅ Documentation

- [ ] README.md updated
- [ ] DEPLOYMENT.md reviewed
- [ ] API documentation complete
- [ ] Environment variable documentation

## ✅ Git & Version Control

- [ ] All changes committed
- [ ] No sensitive data in repository
- [ ] `.gitignore` properly configured
- [ ] Repository pushed to GitHub

## 🚀 Deployment Steps

### Backend (Render)
1. [ ] Connect GitHub repository
2. [ ] Configure build/start commands
3. [ ] Set environment variables
4. [ ] Deploy service
5. [ ] Verify deployment
6. [ ] Create superuser via shell
7. [ ] Test API endpoints

### Frontend (Vercel)
1. [ ] Connect GitHub repository
2. [ ] Configure build settings
3. [ ] Set `VITE_API_URL` environment variable
4. [ ] Deploy project
5. [ ] Verify deployment
6. [ ] Test application

### Post-Deployment
1. [ ] Update backend CORS with frontend URL
2. [ ] Test full application flow
3. [ ] Create demo accounts
4. [ ] Monitor error logs
5. [ ] Set up uptime monitoring

## 🎉 Launch

- [ ] Frontend accessible at Vercel URL
- [ ] Backend accessible at Render URL
- [ ] Admin panel accessible
- [ ] All features working
- [ ] SSL/HTTPS enabled
- [ ] No console errors

---

**Ready to deploy!** 🚀

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.
