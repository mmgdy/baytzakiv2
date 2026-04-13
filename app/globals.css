@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Cairo:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bz-midnight:    #050810;
  --bz-navy:        #080D1A;
  --bz-navy-light:  #0D1528;
  --bz-navy-card:   #0F1A2E;
  --bz-electric:    #00D4FF;
  --bz-plasma:      #7B61FF;
  --bz-aurora:      #00FFB3;
  --bz-ember:       #FF6B35;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: var(--bz-midnight); color: #F0F4FF; -webkit-font-smoothing: antialiased; }

/* scrollbar-none utility */
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

/* Glass card */
.glass-card { background: rgba(15, 26, 46, 0.6); backdrop-filter: blur(12px); }

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, var(--bz-electric), var(--bz-plasma));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Dot animations */
.dot-1 { animation: dot 1.2s infinite 0s; }
.dot-2 { animation: dot 1.2s infinite 0.2s; }
.dot-3 { animation: dot 1.2s infinite 0.4s; }
@keyframes dot { 0%,80%,100%{opacity:0.2;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }

/* Status pulse */
.status-pulse { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* Message in */
.message-in { animation: msgIn 0.3s ease; }
@keyframes msgIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

/* Background grid pattern */
.bg-grid {
  background-image: linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Hero gradient */
.bg-hero-gradient {
  background: radial-gradient(ellipse at 30% 0%, rgba(0,212,255,0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 100%, rgba(123,97,255,0.06) 0%, transparent 60%);
}
