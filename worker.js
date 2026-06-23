export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle contact form submission
    if (url.pathname === '/contact' && request.method === 'POST') {
      try {
        const data = await request.json();

        // Basic validation
        const { name, email, subject, message } = data;
        if (!name || !email || !subject || !message) {
          return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Send email via Resend (https://resend.com)
        // Setup: 1) Create a free Resend account  2) Get an API key
        // 3) Add it as a Worker secret:  wrangler secret put RESEND_API_KEY
        // 4) Verify a sending domain in Resend (or use their shared onboarding domain for testing)
        if (env.RESEND_API_KEY) {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Portfolio Contact <onboarding@resend.dev>', // swap once your domain is verified in Resend
              to: ['musuya@tuta.io'],
              reply_to: email,
              subject: `[Portfolio] ${subject}`,
              text: `New message from your portfolio contact form\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
            })
          });

          if (!emailRes.ok) {
            const errText = await emailRes.text();
            console.error('Resend error:', errText);
            return new Response(JSON.stringify({ success: false, error: 'Email delivery failed' }), {
              status: 502,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } else {
          // No RESEND_API_KEY configured yet — log so it's at least visible in `wrangler tail`,
          // and tell the client honestly that delivery isn't wired up rather than faking success.
          console.warn('RESEND_API_KEY not set — contact form submission was NOT emailed:', data);
          return new Response(JSON.stringify({ success: false, error: 'not_configured' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Morgan Musuya | Developer, Designer & Photographer</title>
    <meta name="description" content="Morgan Musuya - Developer, Designer & Photographer based in Nairobi, Kenya. Building digital experiences and telling stories through the lens.">
    <meta name="author" content="Morgan Musuya">
    <meta name="keywords" content="Morgan Musuya, Developer, Designer, Photographer, Nairobi, Kenya, Web Development, UI/UX, Photography">
    
    <!-- Open Graph / Social -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Morgan Musuya | Developer, Designer & Photographer">
    <meta property="og:description" content="Building digital experiences and telling stories through the lens. Based in Nairobi, Kenya.">
    <meta property="og:image" content="https://avatars.githubusercontent.com/u/38616809?v=4">
    <meta property="og:url" content="https://musuya.musuya.workers.dev">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://avatars.githubusercontent.com/u/38616809?v=4">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary: #6366f1;
            --secondary: #ec4899;
            --accent: #06b6d4;
            --photo: #f59e0b;
            --dark: #0f172a;
            --light: #f8fafc;
            --surface: rgba(255,255,255,0.03);
            --surface-hover: rgba(255,255,255,0.06);
            --border: rgba(255,255,255,0.08);
            --text: #f8fafc;
            --text-muted: rgba(255,255,255,0.6);
            --cursor-size: 12px;
            --cursor-hover-size: 40px;
        }
        
        [data-theme="light"] {
            --dark: #f8fafc;
            --light: #0f172a;
            --surface: rgba(15, 23, 42, 0.03);
            --surface-hover: rgba(15, 23, 42, 0.06);
            --border: rgba(15, 23, 42, 0.08);
            --text: #0f172a;
            --text-muted: rgba(15, 23, 42, 0.6);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            cursor: none;
        }
        
        html {
            scroll-behavior: smooth;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: var(--dark);
            color: var(--text);
            overflow-x: hidden;
            line-height: 1.6;
            transition: background 0.5s ease, color 0.5s ease;
        }
        
        h1, h2, h3, .logo {
            font-family: 'Space Grotesk', sans-serif;
        }
        
        .serif {
            font-family: 'Playfair Display', serif;
        }
        
        .mono {
            font-family: 'JetBrains Mono', monospace;
        }
        
        /* Custom Cursor */
        .cursor {
            position: fixed;
            top: 0;
            left: 0;
            width: var(--cursor-size);
            height: var(--cursor-size);
            border: 2px solid var(--primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: width 0.3s, height 0.3s, background 0.3s, border-color 0.3s;
            transform: translate(-50%, -50%);
            mix-blend-mode: difference;
        }
        
        .cursor.hover {
            width: var(--cursor-hover-size);
            height: var(--cursor-hover-size);
            background: rgba(99, 102, 241, 0.1);
            border-color: var(--secondary);
        }
        
        .cursor-dot {
            position: fixed;
            top: 0;
            left: 0;
            width: 4px;
            height: 4px;
            background: var(--primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
        }
        
        /* Animated gradient background */
        .gradient-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: linear-gradient(-45deg, var(--dark), #1e1b4b, #312e81, var(--dark));
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
        }
        
        [data-theme="light"] .gradient-bg {
            background: linear-gradient(-45deg, #f8fafc, #e0e7ff, #fce7f3, #f8fafc);
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* Floating orbs */
        .orb {
            position: fixed;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.3;
            z-index: -1;
            animation: float 20s infinite ease-in-out;
        }
        
        .orb-1 {
            width: 400px;
            height: 400px;
            background: var(--primary);
            top: -100px;
            right: -100px;
            animation-delay: 0s;
        }
        
        .orb-2 {
            width: 300px;
            height: 300px;
            background: var(--secondary);
            bottom: -50px;
            left: -50px;
            animation-delay: -5s;
        }
        
        .orb-3 {
            width: 250px;
            height: 250px;
            background: var(--accent);
            top: 50%;
            left: 50%;
            animation-delay: -10s;
        }
        
        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        /* Navigation */
        nav {
            position: fixed;
            top: 0;
            width: 100%;
            padding: 1.5rem 5%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(20px);
            background: rgba(15, 23, 42, 0.7);
            border-bottom: 1px solid var(--border);
            transition: all 0.3s;
        }
        
        [data-theme="light"] nav {
            background: rgba(248, 250, 252, 0.7);
        }
        
        nav.scrolled {
            padding: 1rem 5%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
        }
        
        .nav-right {
            display: flex;
            align-items: center;
            gap: 2rem;
        }
        
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        
        .nav-links a {
            color: var(--text-muted);
            text-decoration: none;
            font-weight: 500;
            font-size: 0.85rem;
            transition: color 0.3s;
            position: relative;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .nav-links a:hover {
            color: var(--text);
        }
        
        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            transition: width 0.3s;
        }
        
        .nav-links a:hover::after {
            width: 100%;
        }
        
        /* Theme Toggle */
        .theme-toggle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--surface);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: all 0.3s;
            color: var(--text);
        }
        
        .theme-toggle:hover {
            background: var(--surface-hover);
            transform: rotate(180deg);
        }
        
        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 0 5%;
            position: relative;
        }
        
        .hero-content {
            max-width: 900px;
        }
        
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 1.5rem;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 50px;
            color: var(--primary);
            font-weight: 500;
            font-size: 0.85rem;
            margin-bottom: 2rem;
            animation: fadeInUp 0.8s ease;
            font-family: 'JetBrains Mono', monospace;
        }
        
        .badge .pulse {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .hero h1 {
            font-size: clamp(3rem, 8vw, 6rem);
            font-weight: 700;
            line-height: 1.05;
            margin-bottom: 1.5rem;
            animation: fadeInUp 0.8s ease 0.2s both;
            letter-spacing: -2px;
        }
        
        .hero h1 .gradient-text {
            background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            background-size: 200% 200%;
            animation: gradientText 5s ease infinite;
        }
        
        @keyframes gradientText {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .hero-tagline {
            font-size: 1.4rem;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
            animation: fadeInUp 0.8s ease 0.3s both;
            font-family: 'Playfair Display', serif;
            font-style: italic;
        }
        
        .hero p {
            font-size: 1.1rem;
            color: var(--text-muted);
            margin-bottom: 2.5rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            animation: fadeInUp 0.8s ease 0.4s both;
        }
        
        .hero-roles {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 2.5rem;
            animation: fadeInUp 0.8s ease 0.5s both;
        }
        
        .role-tag {
            padding: 0.5rem 1.2rem;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 50px;
            font-size: 0.85rem;
            color: var(--text-muted);
            font-family: 'JetBrains Mono', monospace;
            transition: all 0.3s;
        }
        
        .role-tag:hover {
            border-color: var(--primary);
            color: var(--primary);
            transform: translateY(-2px);
        }
        
        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            animation: fadeInUp 0.8s ease 0.6s both;
        }
        
        .btn {
            padding: 1rem 2.5rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            position: relative;
            overflow: hidden;
            border: none;
            font-size: 0.95rem;
        }
        
        .btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        
        .btn:active::before {
            width: 300px;
            height: 300px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }
        
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 20px 40px rgba(99, 102, 241, 0.4);
        }
        
        .btn-secondary {
            background: transparent;
            color: var(--text);
            border: 2px solid var(--border);
        }
        
        .btn-secondary:hover {
            border-color: var(--accent);
            color: var(--accent);
            transform: translateY(-3px);
        }
        
        .btn-photo {
            background: linear-gradient(135deg, var(--photo), #f97316);
            color: white;
            box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
        }
        
        .btn-photo:hover {
            transform: translateY(-3px);
            box-shadow: 0 20px 40px rgba(245, 158, 11, 0.4);
        }
        
        .btn .arrow {
            transition: transform 0.3s;
        }
        
        .btn:hover .arrow {
            transform: translateX(4px);
        }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Scroll indicator */
        .scroll-indicator {
            position: absolute;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            animation: bounce 2s infinite;
        }
        
        .scroll-indicator .mouse {
            width: 24px;
            height: 40px;
            border: 2px solid var(--text-muted);
            border-radius: 12px;
            position: relative;
        }
        
        .scroll-indicator .mouse::before {
            content: '';
            position: absolute;
            top: 6px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 8px;
            background: var(--text-muted);
            border-radius: 2px;
            animation: scrollWheel 2s infinite;
        }
        
        @keyframes scrollWheel {
            0%, 100% { opacity: 1; top: 6px; }
            50% { opacity: 0; top: 18px; }
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
            40% { transform: translateX(-50%) translateY(-10px); }
            60% { transform: translateX(-50%) translateY(-5px); }
        }
        
        /* Sections */
        section {
            padding: 8rem 5%;
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
        }
        
        .section-header {
            text-align: center;
            margin-bottom: 5rem;
        }
        
        .section-label {
            display: inline-block;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 1rem;
        }
        
        .section-title {
            font-size: clamp(2rem, 5vw, 3rem);
            margin-bottom: 1rem;
            letter-spacing: -1px;
        }
        
        .section-subtitle {
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto;
        }
        
        /* About Section */
        .about-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5rem;
            align-items: center;
        }
        
        .about-image {
            position: relative;
        }
        
        .about-image-wrapper {
            position: relative;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        }
        
        .about-image-wrapper::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            opacity: 0.1;
            z-index: 1;
            pointer-events: none;
        }
        
        .about-image-wrapper img {
            width: 100%;
            height: 500px;
            object-fit: cover;
            display: block;
            transition: transform 0.5s;
        }
        
        .about-image-wrapper:hover img {
            transform: scale(1.05);
        }
        
        .about-image-frame {
            position: absolute;
            inset: -15px;
            border: 2px solid var(--primary);
            border-radius: 30px;
            opacity: 0.3;
            z-index: -1;
        }
        
        .about-text h3 {
            font-size: 2rem;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .about-text p {
            color: var(--text-muted);
            margin-bottom: 1.5rem;
            font-size: 1.05rem;
        }
        
        .about-location {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 50px;
            font-size: 0.9rem;
            color: var(--text-muted);
            margin-bottom: 2rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .stat-item {
            text-align: center;
            padding: 1.5rem;
            background: var(--surface);
            border-radius: 16px;
            border: 1px solid var(--border);
            transition: all 0.3s;
        }
        
        .stat-item:hover {
            background: var(--surface-hover);
            transform: translateY(-3px);
            border-color: var(--primary);
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1;
        }
        
        .stat-label {
            color: var(--text-muted);
            font-size: 0.85rem;
            margin-top: 0.5rem;
            font-family: 'JetBrains Mono', monospace;
        }
        
        /* Skills Section */
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
        }
        
        .skill-card {
            padding: 2.5rem;
            background: var(--surface);
            border-radius: 24px;
            border: 1px solid var(--border);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            transform-style: preserve-3d;
        }
        
        .skill-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            transform: scaleX(0);
            transition: transform 0.4s;
            transform-origin: left;
        }
        
        .skill-card:hover {
            transform: translateY(-8px) rotateX(5deg);
            background: var(--surface-hover);
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
            border-color: rgba(99, 102, 241, 0.2);
        }
        
        .skill-card:hover::before {
            transform: scaleX(1);
        }
        
        .skill-icon {
            width: 60px;
            height: 60px;
            border-radius: 16px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: white;
        }
        
        .skill-card h3 {
            margin-bottom: 0.75rem;
            font-size: 1.25rem;
        }
        
        .skill-card p {
            color: var(--text-muted);
            font-size: 0.95rem;
        }
        
        .skill-tags {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-top: 1.5rem;
        }
        
        .skill-tag {
            padding: 0.25rem 0.75rem;
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary);
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 500;
            font-family: 'JetBrains Mono', monospace;
        }
        
        /* Photography Section */
        .photo-hero {
            text-align: center;
            padding: 6rem 5% 4rem;
            max-width: 900px;
            margin: 0 auto;
        }
        
        .photo-hero .serif {
            font-size: 2rem;
            color: var(--text-muted);
            font-style: italic;
            margin-bottom: 1.5rem;
        }
        
        .photo-hero p {
            color: var(--text-muted);
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto 2rem;
        }
        
        .photo-gallery {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            padding: 0 5% 6rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .photo-item {
            position: relative;
            border-radius: 20px;
            overflow: hidden;
            aspect-ratio: 3/4;
            cursor: none;
            transition: all 0.4s;
        }
        
        .photo-item:nth-child(2) {
            aspect-ratio: 3/5;
            grid-row: span 2;
        }
        
        .photo-item:nth-child(4) {
            aspect-ratio: 4/3;
            grid-column: span 2;
        }
        
        .photo-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s, filter 0.4s;
            filter: grayscale(30%);
        }
        
        .photo-item:hover img {
            transform: scale(1.1);
            filter: grayscale(0%);
        }
        
        .photo-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
            display: flex;
            align-items: flex-end;
            padding: 1.5rem;
            opacity: 0;
            transition: opacity 0.4s;
        }
        
        .photo-item:hover .photo-overlay {
            opacity: 1;
        }
        
        .photo-overlay h4 {
            color: white;
            font-size: 1.1rem;
            font-family: 'Playfair Display', serif;
        }
        
        .photo-overlay p {
            color: rgba(255,255,255,0.7);
            font-size: 0.85rem;
            font-family: 'JetBrains Mono', monospace;
        }
        
        .photo-cta {
            text-align: center;
            padding-bottom: 6rem;
        }
        
        /* Projects Section */
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2.5rem;
        }
        
        .project-card {
            position: relative;
            border-radius: 24px;
            overflow: hidden;
            background: var(--surface);
            border: 1px solid var(--border);
            transition: all 0.4s;
        }
        
        .project-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.3);
            border-color: rgba(99, 102, 241, 0.2);
        }
        
        .project-image {
            width: 100%;
            height: 220px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            position: relative;
            overflow: hidden;
        }
        
        .project-image::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
        }
        
        .project-links {
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            display: flex;
            gap: 0.5rem;
            z-index: 2;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s;
        }
        
        .project-card:hover .project-links {
            opacity: 1;
            transform: translateY(0);
        }
        
        .project-link {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--dark);
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .project-link:hover {
            background: white;
            transform: scale(1.1);
        }
        
        .project-content {
            padding: 1.5rem;
        }
        
        .project-tags {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-bottom: 1rem;
        }
        
        .tag {
            padding: 0.3rem 0.8rem;
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary);
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 500;
            font-family: 'JetBrains Mono', monospace;
        }
        
        .project-content h3 {
            margin-bottom: 0.5rem;
            font-size: 1.2rem;
        }
        
        .project-content p {
            color: var(--text-muted);
            font-size: 0.95rem;
        }
        
        /* Testimonials */
        .testimonials {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            max-width: 900px;
            margin: 0 auto;
        }
        
        .testimonial-card {
            padding: 2rem;
            background: var(--surface);
            border-radius: 24px;
            border: 1px solid var(--border);
            position: relative;
        }
        
        .testimonial-card::before {
            content: '"';
            position: absolute;
            top: 1rem;
            right: 1.5rem;
            font-size: 4rem;
            color: var(--primary);
            opacity: 0.2;
            font-family: serif;
            line-height: 1;
        }
        
        .testimonial-text {
            color: var(--text-muted);
            font-style: italic;
            margin-bottom: 1.5rem;
            line-height: 1.7;
        }
        
        .testimonial-author {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .testimonial-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 1rem;
        }
        
        .testimonial-info h4 {
            font-size: 1rem;
            margin-bottom: 0.2rem;
        }
        
        .testimonial-info p {
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        
        /* Contact Section */
        .contact-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: start;
        }
        
        .contact-info h3 {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        .contact-info > p {
            color: var(--text-muted);
            margin-bottom: 2rem;
        }
        
        .contact-methods {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .contact-method {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            background: var(--surface);
            border-radius: 16px;
            border: 1px solid var(--border);
            transition: all 0.3s;
            text-decoration: none;
            color: var(--text);
        }
        
        .contact-method:hover {
            background: var(--surface-hover);
            border-color: var(--primary);
            transform: translateX(5px);
        }
        
        .contact-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }
        
        .contact-details h4 {
            font-size: 1rem;
            margin-bottom: 0.2rem;
        }
        
        .contact-details p {
            font-size: 0.9rem;
            color: var(--text-muted);
            font-family: 'JetBrains Mono', monospace;
        }
        
        /* Contact Form */
        .contact-form-wrapper {
            padding: 2.5rem;
            background: var(--surface);
            border-radius: 24px;
            border: 1px solid var(--border);
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-muted);
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 1rem;
            background: var(--dark);
            border: 1px solid var(--border);
            border-radius: 12px;
            color: var(--text);
            font-family: inherit;
            font-size: 1rem;
            transition: all 0.3s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .form-group textarea {
            min-height: 120px;
            resize: vertical;
        }
        
        .form-submit {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1rem;
            cursor: none;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        
        .form-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }
        
        .form-submit:active {
            transform: translateY(0);
        }
        
        .form-submit:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .form-status {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 12px;
            font-size: 0.9rem;
            display: none;
        }
        
        .form-status.success {
            display: block;
            background: rgba(34, 197, 94, 0.1);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.2);
        }
        
        .form-status.error {
            display: block;
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.2);
        }
        
        /* Social Links */
        .social-section {
            text-align: center;
            margin-top: 4rem;
        }
        
        .social-section p {
            color: var(--text-muted);
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
        }
        
        .social-links {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
        
        .social-link {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            background: var(--surface);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text);
            text-decoration: none;
            font-size: 1.25rem;
            transition: all 0.3s;
            position: relative;
        }
        
        .social-link:hover {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            transform: translateY(-5px) scale(1.05);
            border-color: transparent;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }
        
        .social-link .tooltip {
            position: absolute;
            bottom: -35px;
            left: 50%;
            transform: translateX(-50%) translateY(5px);
            padding: 0.4rem 0.8rem;
            background: var(--dark);
            color: var(--text);
            border-radius: 8px;
            font-size: 0.75rem;
            font-family: 'JetBrains Mono', monospace;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s;
            border: 1px solid var(--border);
        }
        
        .social-link:hover .tooltip {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        
        /* Footer */
        footer {
            text-align: center;
            padding: 3rem 2rem;
            color: var(--text-muted);
            border-top: 1px solid var(--border);
            font-size: 0.9rem;
        }
        
        footer .heart {
            color: var(--secondary);
            display: inline-block;
            animation: heartbeat 1.5s infinite;
        }
        
        @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        /* Back to top */
        .back-to-top {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s;
            z-index: 100;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }
        
        .back-to-top.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .back-to-top:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
        }
        
        /* Responsive */
        @media (max-width: 968px) {
            .about-grid,
            .contact-container {
                grid-template-columns: 1fr;
                gap: 3rem;
            }
            
            .photo-gallery {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .photo-item:nth-child(2),
            .photo-item:nth-child(4) {
                grid-row: auto;
                grid-column: auto;
                aspect-ratio: 3/4;
            }
            
            .nav-links {
                display: none;
            }
            
            .cursor, .cursor-dot {
                display: none;
            }
            
            * {
                cursor: auto;
            }
        }
        
        @media (max-width: 640px) {
            .stats {
                grid-template-columns: 1fr;
            }
            
            .projects-grid,
            .photo-gallery {
                grid-template-columns: 1fr;
            }
            
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .hero-roles {
                gap: 0.5rem;
            }
            
            .role-tag {
                font-size: 0.75rem;
                padding: 0.4rem 1rem;
            }
        }
        
        /* Scroll animations */
        .reveal {
            opacity: 0;
            transform: translateY(40px);
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        
        /* Loading animation for text scramble */
        .scramble-text {
            display: inline-block;
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    </style>
</head>
<body>
    <!-- Custom Cursor -->
    <div class="cursor"></div>
    <div class="cursor-dot"></div>
    
    <!-- Background -->
    <div class="gradient-bg"></div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    
    <!-- Navigation -->
    <nav id="navbar">
        <div class="logo">MM.</div>
        <div class="nav-right">
            <ul class="nav-links">
                <li><a href="#about">About</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#photography">Photography</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">🌙</button>
        </div>
    </nav>
    
    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <div class="badge">
                <span class="pulse"></span>
                Available for opportunities
            </div>
            <h1>
                Hi, I'm<br>
                <span class="gradient-text scramble-text" id="heroName">Morgan Musuya</span>
            </h1>
            <p class="hero-tagline serif">"Telling stories through code and lens"</p>
            <div class="hero-roles">
                <span class="role-tag">💻 Developer</span>
                <span class="role-tag">🎨 Designer</span>
                <span class="role-tag">📸 Photographer</span>
            </div>
            <p>Building digital experiences and capturing moments that matter. Based in Nairobi, Kenya — creating at the intersection of technology and art.</p>
            <div class="cta-buttons">
                <a href="#projects" class="btn btn-primary">
                    View My Work
                    <span class="arrow">→</span>
                </a>
                <a href="https://morganmusuya.pixieset.com" target="_blank" class="btn btn-photo">
                    📸 See My Photos
                </a>
                <a href="#contact" class="btn btn-secondary">
                    Get In Touch
                </a>
            </div>
        </div>
        <div class="scroll-indicator">
            <span>Scroll</span>
            <div class="mouse"></div>
        </div>
    </section>
    
    <!-- About Section -->
    <section id="about" class="reveal">
        <div class="section-header">
            <span class="section-label mono">01. About</span>
            <h2 class="section-title">Who I Am</h2>
            <p class="section-subtitle">A multi-disciplinary creative passionate about technology and visual storytelling</p>
        </div>
        <div class="about-grid">
            <div class="about-image">
                <div class="about-image-wrapper">
                    <img src="https://avatars.githubusercontent.com/u/38616809?v=4" alt="Morgan Musuya - Developer, Designer & Photographer" loading="lazy">
                </div>
                <div class="about-image-frame"></div>
            </div>
            <div class="about-text">
                <div class="about-location">
                    <span>📍</span> Nairobi, Kenya
                </div>
                <h3>Code Meets Creativity</h3>
                <p>I'm Morgan Musuya — a developer, designer, and photographer based in Nairobi. My goal is to tell <em>"THE STORY"</em> — whether that's through clean code, intuitive interfaces, or compelling photographs.</p>
                <p>By day, I build web applications and design user experiences. By weekend, I'm behind the camera capturing the world around me. This dual perspective gives me a unique approach to digital creation — I understand both the technical architecture and the visual narrative.</p>
                <p>When I'm not coding or shooting, you'll find me exploring new design trends, contributing to open source, or collaborating with fellow creators on Dribbble and beyond.</p>
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-number">3+</div>
                        <div class="stat-label">Years Coding</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">10+</div>
                        <div class="stat-label">Projects Shot</div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Skills Section -->
    <section id="skills" class="reveal">
        <div class="section-header">
            <span class="section-label mono">02. Skills</span>
            <h2 class="section-title">My Expertise</h2>
            <p class="section-subtitle">Technologies and creative skills I work with daily</p>
        </div>
        <div class="skills-grid">
            <div class="skill-card reveal reveal-delay-1">
                <div class="skill-icon">🚀</div>
                <h3>Web Development</h3>
                <p>Building fast, responsive, and scalable web applications using modern frameworks and technologies.</p>
                <div class="skill-tags">
                    <span class="skill-tag">React</span>
                    <span class="skill-tag">Node.js</span>
                    <span class="skill-tag">PHP</span>
                    <span class="skill-tag">HTML/CSS</span>
                </div>
            </div>
            <div class="skill-card reveal reveal-delay-2">
                <div class="skill-icon">🎨</div>
                <h3>UI/UX Design</h3>
                <p>Creating intuitive and visually stunning user interfaces that deliver exceptional experiences.</p>
                <div class="skill-tags">
                    <span class="skill-tag">Figma</span>
                    <span class="skill-tag">Dribbble</span>
                    <span class="skill-tag">Prototyping</span>
                </div>
            </div>
            <div class="skill-card reveal reveal-delay-3">
                <div class="skill-icon">⚡</div>
                <h3>Cloud & Edge</h3>
                <p>Designing robust cloud infrastructure and serverless solutions for optimal performance.</p>
                <div class="skill-tags">
                    <span class="skill-tag">Cloudflare</span>
                    <span class="skill-tag">Workers</span>
                    <span class="skill-tag">Serverless</span>
                </div>
            </div>
            <div class="skill-card reveal reveal-delay-1">
                <div class="skill-icon">📸</div>
                <h3>Photography</h3>
                <p>Capturing stories and emotions through the lens. Specializing in portrait and event photography.</p>
                <div class="skill-tags">
                    <span class="skill-tag">Portrait</span>
                    <span class="skill-tag">Events</span>
                    <span class="skill-tag">Storytelling</span>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Photography Section -->
    <!--
      IMPORTANT: The 6 images below are placeholder stock photos from Unsplash, not Morgan's own work.
      Replace each src with a real photo URL before launch (e.g. host on Cloudflare Images, R2, or
      link directly to images from morganmusuya.pixieset.com). Showing stock photos as personal work
      is a credibility risk if anyone reverse-image-searches them. Update the alt text and overlay
      captions (h4/p) to match the real photos too.
    -->
    <section id="photography" class="reveal" style="max-width: 100%; padding: 0;">
        <div class="photo-hero">
            <span class="section-label mono">03. Photography</span>
            <h2 class="section-title">Through The Lens</h2>
            <p class="serif">"My goal is to tell THE STORY through the lens."</p>
            <p>Photography is more than a hobby — it's my way of seeing the world. Every frame is an opportunity to capture emotion, preserve memory, and share perspective.</p>
            <a href="https://morganmusuya.pixieset.com" target="_blank" class="btn btn-photo" style="margin-top: 1rem;">
                Visit Full Portfolio 📸
            </a>
        </div>
        <div class="photo-gallery">
            <!-- TODO: replace with real photo -->
            <div class="photo-item reveal reveal-delay-1">
                <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop" alt="Landscape photography" loading="lazy">
                <div class="photo-overlay">
                    <div>
                        <h4>Golden Hour</h4>
                        <p>Nature Series</p>
                    </div>
                </div>
            </div>
            <!-- TODO: replace with real photo -->
            <div class="photo-item reveal reveal-delay-2">
                <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=900&fit=crop" alt="Portrait photography" loading="lazy">
                <div class="photo-overlay">
                    <div>
                        <h4>Natural Light</h4>
                        <p>Portrait Series</p>
                    </div>
                </div>
            </div>
            <!-- TODO: replace with real photo -->
            <div class="photo-item reveal reveal-delay-3">
                <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=800&fit=crop" alt="Street photography" loading="lazy">
                <div class="photo-overlay">
                    <div>
                        <h4>Urban Stories</h4>
                        <p>Street Series</p>
                    </div>
                </div>
            </div>
            <!-- TODO: replace with real photo -->
            <div class="photo-item reveal reveal-delay-1">
                <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop" alt="Event photography" loading="lazy">
                <div class="photo-overlay">
                    <div>
                        <h4>Celebration</h4>
                        <p>Event Series</p>
                    </div>
                </div>
            </div>
            <!-- TODO: replace with real photo -->
            <div class="photo-item reveal reveal-delay-2">
                <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=800&fit=crop" alt="Nature photography" loading="lazy">
                <div class="photo-overlay">
                    <div>
                        <h4>Wilderness</h4>
                        <p>Nature Series</p>
                    </div>
                </div>
            </div>
            <!-- TODO: replace with real photo -->
            <div class="photo-item reveal reveal-delay-3">
                <img src="https://images.unsplash.com/photo-1554048612-387768052bf7?w=600&h=800&fit=crop" alt="Studio photography" loading="lazy">
                <div class="photo-overlay">
                    <div>
                        <h4>Studio Light</h4>
                        <p>Studio Series</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="photo-cta">
            <a href="https://morganmusuya.pixieset.com" target="_blank" class="btn btn-photo" style="font-size: 1.1rem; padding: 1.2rem 3rem;">
                Explore Full Gallery on Pixieset →
            </a>
        </div>
    </section>
    
    <!-- Projects Section -->
    <section id="projects" class="reveal">
        <div class="section-header">
            <span class="section-label mono">04. Projects</span>
            <h2 class="section-title">Featured Work</h2>
            <p class="section-subtitle">Some of my recent development projects and contributions</p>
        </div>
        <div class="projects-grid">
            <div class="project-card reveal reveal-delay-1">
                <div class="project-image" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
                    🔐
                    <div class="project-links">
                        <a href="https://github.com/Musuya/project-1" class="project-link" target="_blank" title="GitHub">GH</a>
                    </div>
                </div>
                <div class="project-content">
                    <div class="project-tags">
                        <span class="tag">PHP</span>
                        <span class="tag">MySQL</span>
                        <span class="tag">Auth</span>
                    </div>
                    <h3>Online Login System</h3>
                    <p>A secure authentication system with user registration, login, and session management built with PHP.</p>
                </div>
            </div>
            <div class="project-card reveal reveal-delay-2">
                <div class="project-image" style="background: linear-gradient(135deg, #ec4899, #f59e0b);">
                    📺
                    <div class="project-links">
                        <a href="https://github.com/Musuya/strimio-desktop" class="project-link" target="_blank" title="GitHub">GH</a>
                    </div>
                </div>
                <div class="project-content">
                    <div class="project-tags">
                        <span class="tag">Desktop</span>
                        <span class="tag">Streaming</span>
                        <span class="tag">Electron</span>
                    </div>
                    <h3>Strimio Desktop</h3>
                    <p>Contributions to a desktop streaming application, focusing on UI components and user experience.</p>
                </div>
            </div>
            <!--
              TODO: This is your third project card. The old "Spoon-Knife Demo" placeholder
              (GitHub's own tutorial-fork repo) has been removed since it read as a non-project.
              Replace this card with a real third project, or temporarily delete the whole
              <div class="project-card"> block below and let the grid show 2 cards until you have one.
            -->
            <div class="project-card reveal reveal-delay-3">
                <div class="project-image" style="background: linear-gradient(135deg, #06b6d4, #6366f1);">
                    ➕
                </div>
                <div class="project-content">
                    <div class="project-tags">
                        <span class="tag">Coming Soon</span>
                    </div>
                    <h3>Next Project</h3>
                    <p>Currently building something new — check back soon, or get in touch if you'd like to collaborate.</p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Testimonials Section -->
    <section id="testimonials" class="reveal">
        <div class="section-header">
            <span class="section-label mono">05. Testimonials</span>
            <h2 class="section-title">What People Say</h2>
            <p class="section-subtitle">Feedback from collaborators, clients, and subjects</p>
        </div>
        <div class="testimonials">
            <div class="testimonial-card reveal reveal-delay-1">
                <p class="testimonial-text">Working with Morgan was a pleasure. He delivered a secure authentication system ahead of schedule and exceeded our expectations in code quality.</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">SK</div>
                    <div class="testimonial-info">
                        <h4>Sarah Kimani</h4>
                        <p>Product Manager</p>
                    </div>
                </div>
            </div>
            <div class="testimonial-card reveal reveal-delay-2">
                <p class="testimonial-text">The photos Morgan took at our event were absolutely stunning. He has an incredible eye for capturing candid moments and genuine emotion.</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">WM</div>
                    <div class="testimonial-info">
                        <h4>Wanjiku M.</h4>
                        <p>Event Client</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Contact Section -->
    <section id="contact" class="reveal">
        <div class="section-header">
            <span class="section-label mono">06. Contact</span>
            <h2 class="section-title">Let's Work Together</h2>
            <p class="section-subtitle">Have a project in mind or just want to chat? I'm always open to discussing new opportunities.</p>
        </div>
        <div class="contact-container">
            <div class="contact-info">
                <h3>Get in Touch</h3>
                <p>Whether you need a website, design work, or photography services — I'd love to hear from you!</p>
                <div class="contact-methods">
                    <a href="mailto:musuya@tuta.io" class="contact-method">
                        <div class="contact-icon">✉️</div>
                        <div class="contact-details">
                            <h4>Email</h4>
                            <p>musuya@tuta.io</p>
                        </div>
                    </a>
                    <a href="tel:+254700323577" class="contact-method">
                        <div class="contact-icon">📱</div>
                        <div class="contact-details">
                            <h4>Phone</h4>
                            <p>+254 700 323 577</p>
                        </div>
                    </a>
                    <a href="https://morganmusuya.pixieset.com" target="_blank" class="contact-method">
                        <div class="contact-icon" style="background: linear-gradient(135deg, #f59e0b, #f97316);">📸</div>
                        <div class="contact-details">
                            <h4>Photography</h4>
                            <p>morganmusuya.pixieset.com</p>
                        </div>
                    </a>
                    <a href="https://github.com/Musuya" target="_blank" class="contact-method">
                        <div class="contact-icon">⭐</div>
                        <div class="contact-details">
                            <h4>GitHub</h4>
                            <p>github.com/Musuya</p>
                        </div>
                    </a>
                </div>
            </div>
            <div class="contact-form-wrapper">
                <form id="contactForm" action="/contact" method="POST">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" placeholder="Your name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label for="subject">Subject</label>
                        <input type="text" id="subject" name="subject" placeholder="Web dev, design, or photography?" required>
                    </div>
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" placeholder="Tell me about your project..." required></textarea>
                    </div>
                    <button type="submit" class="form-submit">Send Message →</button>
                    <div class="form-status" id="formStatus"></div>
                </form>
            </div>
        </div>
        
        <div class="social-section">
            <p>Or find me on these platforms</p>
            <div class="social-links">
                <a href="https://github.com/Musuya" target="_blank" class="social-link" aria-label="GitHub">
                    <span>⭐</span>
                    <span class="tooltip">GitHub</span>
                </a>
                <a href="https://dribbble.com/musuya148b" target="_blank" class="social-link" aria-label="Dribbble">
                    <span>🏀</span>
                    <span class="tooltip">Dribbble</span>
                </a>
                <a href="https://www.linkedin.com/in/morgan-musuya/" target="_blank" class="social-link" aria-label="LinkedIn">
                    <span>💼</span>
                    <span class="tooltip">LinkedIn</span>
                </a>
                <a href="https://morganmusuya.pixieset.com" target="_blank" class="social-link" aria-label="Photography Portfolio" style="background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.1));">
                    <span>📸</span>
                    <span class="tooltip">Photos</span>
                </a>
                <a href="mailto:musuya@tuta.io" class="social-link" aria-label="Email">
                    <span>✉️</span>
                    <span class="tooltip">Email</span>
                </a>
            </div>
        </div>
    </section>
    
    <!-- Footer -->
    <footer>
        <p>© 2026 Morgan Musuya. Crafted with <span class="heart">💜</span> in Nairobi</p>
    </footer>
    
    <!-- Back to Top -->
    <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>
    
    <script>
        // Custom Cursor
        const cursor = document.querySelector('.cursor');
        const cursorDot = document.querySelector('.cursor-dot');
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });
        
        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
        
        // Cursor hover effect
        const interactiveElements = document.querySelectorAll('a, button, .skill-card, .project-card, .testimonial-card, .contact-method, .photo-item');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
        
        // Text scramble effect for hero name
        class TextScramble {
            constructor(el) {
                this.el = el;
                this.chars = '!<>-_\\\\/[]{}—=+*^?#________';
                this.update = this.update.bind(this);
            }
            setText(newText) {
                const oldText = this.el.innerText;
                const length = Math.max(oldText.length, newText.length);
                const promise = new Promise((resolve) => this.resolve = resolve);
                this.queue = [];
                for (let i = 0; i < length; i++) {
                    const from = oldText[i] || '';
                    const to = newText[i] || '';
                    const start = Math.floor(Math.random() * 40);
                    const end = start + Math.floor(Math.random() * 40);
                    this.queue.push({ from, to, start, end });
                }
                cancelAnimationFrame(this.frameRequest);
                this.frame = 0;
                this.update();
                return promise;
            }
            update() {
                let output = '';
                let complete = 0;
                for (let i = 0, n = this.queue.length; i < n; i++) {
                    let { from, to, start, end, char } = this.queue[i];
                    if (this.frame >= end) {
                        complete++;
                        output += to;
                    } else if (this.frame >= start) {
                        if (!char || Math.random() < 0.28) {
                            char = this.randomChar();
                            this.queue[i].char = char;
                        }
                        output += \`<span style="color: var(--primary)">\${char}</span>\`;
                    } else {
                        output += from;
                    }
                }
                this.el.innerHTML = output;
                if (complete === this.queue.length) {
                    this.resolve();
                } else {
                    this.frameRequest = requestAnimationFrame(this.update);
                    this.frame++;
                }
            }
            randomChar() {
                return this.chars[Math.floor(Math.random() * this.chars.length)];
            }
        }
        
        // Initialize scramble
        const heroName = document.getElementById('heroName');
        const fx = new TextScramble(heroName);
        let counter = 0;
        const phrases = ['Morgan Musuya', 'Developer', 'Designer', 'Photographer'];
        
        function nextPhrase() {
            fx.setText(phrases[counter]).then(() => {
                setTimeout(nextPhrase, 3000);
            });
            counter = (counter + 1) % phrases.length;
        }
        setTimeout(nextPhrase, 2000);
        
        // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        const html = document.documentElement;
        const savedTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
        
        // Navbar scroll effect
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        // Scroll reveal
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        revealElements.forEach(el => revealObserver.observe(el));
        
        // Smooth scroll for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Parallax effect for orbs
        window.addEventListener('mousemove', (e) => {
            const orbs = document.querySelectorAll('.orb');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 20;
                orb.style.transform = \`translate(\${x * speed}px, \${y * speed}px)\`;
            });
        });
        
        // Back to top button
        const backToTop = document.getElementById('backToTop');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Contact form handling
        const contactForm = document.getElementById('contactForm');
        const formStatus = document.getElementById('formStatus');
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.form-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    formStatus.textContent = "✅ Message sent successfully! I'll get back to you soon.";
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                } else {
                    throw new Error(result.error || 'Failed to send');
                }
            } catch (error) {
                // Fallback: open mailto so the message is never silently lost
                const { name, subject, message } = data;
                const body = encodeURIComponent('From: ' + name + '\\n\\n' + message);
                formStatus.textContent = "⚠️ Couldn't send automatically — opening your email client instead.";
                formStatus.className = 'form-status error';
                window.location.href = \`mailto:musuya@tuta.io?subject=\${encodeURIComponent(subject)}&body=\${body}\`;
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }
};
