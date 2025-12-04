# Render.com Deployment Guide

## 📦 Files Created for Render.com

### 1. **Procfile**
Tells Render how to start your application:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 2. **.env.example**
Template for environment variables (do not commit actual .env file)

### 3. **Updated requirements.txt**
Added `python-dotenv` for environment variable management

## 🚀 Deployment Steps on Render.com

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Render.com deployment"
git push origin main
```

### Step 2: Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select `kuy-eng-restaurant` repository

### Step 3: Configure Build Settings

**Basic Settings:**
- **Name:** `kuy-eng-restaurant` (or your preferred name)
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** (leave blank)
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** (leave blank, uses Procfile)

### Step 4: Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

**Required Variables:**
```
PYTHON_VERSION = 3.11
ENVIRONMENT = production
```

**Optional Variables (with defaults):**
```
ALLOWED_ORIGINS = https://your-app-name.onrender.com
MAX_UPLOAD_SIZE = 5242880
UPLOAD_DIR = static/uploads
DATA_DIR = data
```

### Step 5: Set Plan
- Choose **Free Plan** for testing
- Click **"Create Web Service"**

### Step 6: Wait for Deployment
- Render will automatically deploy your app
- First deployment takes 3-5 minutes
- Watch the logs for any errors

## 🌐 After Deployment

### Update CORS Origins
Once deployed, update the `ALLOWED_ORIGINS` environment variable:
```
ALLOWED_ORIGINS = https://your-app-name.onrender.com,https://www.your-domain.com
```

### Access Your Application
- **Frontend:** `https://your-app-name.onrender.com/`
- **Admin:** `https://your-app-name.onrender.com/admin/admin.html`
- **API Docs:** `https://your-app-name.onrender.com/docs`

## ⚠️ Important Notes

### Free Plan Limitations
- **Sleeps after 15 minutes** of inactivity
- **First request after sleep** takes 30-60 seconds to wake up
- **Limited bandwidth** and compute resources
- **No persistent storage** - uploaded files may be lost on redeploy

### Data Persistence
**Problem:** Free Render instances don't have persistent disk storage.

**Solutions:**
1. **Use External Database** (Recommended for production)
   - Switch from JSON files to PostgreSQL/MongoDB
   - Render offers free PostgreSQL database

2. **Use Cloud Storage** for images
   - AWS S3, Cloudinary, or similar
   - Store images externally instead of local disk

3. **Accept Data Loss** (OK for testing)
   - Data resets on each deployment
   - Fine for demo/testing purposes

### Environment Variables in Render

**How to Update:**
1. Go to your service dashboard
2. Click **"Environment"** tab
3. Add/Edit variables
4. Click **"Save Changes"**
5. Service will automatically redeploy

## 🔧 Local Development with Environment Variables

Create a `.env` file (not committed to Git):
```bash
ENVIRONMENT=development
ALLOWED_ORIGINS=*
PORT=8000
```

Then run:
```bash
python main.py
```

## 📝 Useful Render Commands

### View Logs
```bash
# In Render dashboard, click "Logs" tab
```

### Manual Redeploy
```bash
# In Render dashboard, click "Manual Deploy" → "Deploy latest commit"
```

### Shell Access (Paid plans only)
```bash
# Click "Shell" tab in dashboard
```

## 🆘 Troubleshooting

### Build Fails
- Check Python version is 3.11
- Verify `requirements.txt` is correct
- Check build logs for specific errors

### App Won't Start
- Verify `Procfile` exists and is correct
- Check that PORT environment variable is not set manually
- Review application logs

### 500 Errors
- Check if directories exist (`data/`, `static/uploads/`)
- Verify file permissions
- Check application logs for Python errors

### CORS Errors
- Update `ALLOWED_ORIGINS` with your Render domain
- Make sure to include `https://`

## 🔄 Continuous Deployment

Render automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Render auto-deploys in 2-3 minutes
```

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Python on Render](https://render.com/docs/deploy-fastapi)

---

**Ready to deploy? Follow the steps above and your app will be live in minutes!**
