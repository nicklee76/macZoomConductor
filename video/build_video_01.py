#!/usr/bin/env python3
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

VIDEO_DIR = '/Users/coolnick/Projects/browserNexus/marketing/video'
LOGO_DIR = '/Users/coolnick/Projects/browserNexus/marketing/logo'
ASSETS_DIR = '/Users/coolnick/Projects/browserNexus/marketing/website/assets'
FONT_ICELAND = '/tmp/Iceland-Regular.ttf'

os.makedirs(VIDEO_DIR, exist_ok=True)

# 1. Create 1920x1080 Intro Image
def generate_intro_card():
    w, h = 1920, 1080
    img = Image.new('RGBA', (w, h), '#090B10')
    draw = ImageDraw.Draw(img)
    
    # Load and center App Icon
    icon_path = os.path.join(ASSETS_DIR, 'logo-512.png')
    if os.path.exists(icon_path):
        icon = Image.open(icon_path).convert('RGBA')
        icon = icon.resize((220, 220), Image.Resampling.LANCZOS)
        img.paste(icon, ((w - 220) // 2, 280), icon)
    
    # Draw Brand Title in Iceland Font
    try:
        font_logo = ImageFont.truetype(FONT_ICELAND, 110)
        font_sub = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', 38)
        font_tag = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', 30)
    except:
        font_logo = font_sub = font_tag = ImageFont.load_default()
        
    logo_text = "browserNexus"
    bbox_logo = draw.textbbox((0, 0), logo_text, font=font_logo)
    draw.text(((w - (bbox_logo[2] - bbox_logo[0])) // 2, 540), logo_text, fill='#FFFFFF', font=font_logo)
    
    # Feature Badge Pill
    pill_text = "FEATURE 01: CUSTOM ZOOM RULES & DISPLAY BASELINES"
    bbox_pill = draw.textbbox((0, 0), pill_text, font=font_tag)
    pw = (bbox_pill[2] - bbox_pill[0]) + 40
    ph = (bbox_pill[3] - bbox_pill[1]) + 20
    px = (w - pw) // 2
    py = 690
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=12, fill='#1E293B', outline='#38BDF8', width=2)
    draw.text(((w - (bbox_pill[2] - bbox_pill[0])) // 2, py + 10), pill_text, fill='#38BDF8', font=font_tag)
    
    # Subtitle
    sub_text = "Display-Aware Browser Zoom & Window Control for Mac"
    bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
    draw.text(((w - (bbox_sub[2] - bbox_sub[0])) // 2, 780), sub_text, fill='#94A3B8', font=font_sub)
    
    out_path = os.path.join(VIDEO_DIR, 'intro_card_1080p.png')
    img.save(out_path, format='PNG')
    print(f"✓ Created Intro Card: {out_path}")
    return out_path

# 2. Create 1920x1080 Outro Image
def generate_outro_card():
    w, h = 1920, 1080
    img = Image.new('RGBA', (w, h), '#090B10')
    draw = ImageDraw.Draw(img)
    
    # Load and center App Icon
    icon_path = os.path.join(ASSETS_DIR, 'logo-512.png')
    if os.path.exists(icon_path):
        icon = Image.open(icon_path).convert('RGBA')
        icon = icon.resize((180, 180), Image.Resampling.LANCZOS)
        img.paste(icon, ((w - 180) // 2, 260), icon)
        
    try:
        font_logo = ImageFont.truetype(FONT_ICELAND, 90)
        font_head = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', 52)
        font_url = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', 42)
        font_sub = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', 28)
    except:
        font_logo = font_head = font_url = font_sub = ImageFont.load_default()
        
    logo_text = "browserNexus"
    bbox_logo = draw.textbbox((0, 0), logo_text, font=font_logo)
    draw.text(((w - (bbox_logo[2] - bbox_logo[0])) // 2, 480), logo_text, fill='#FFFFFF', font=font_logo)
    
    head_text = "Download the Free Beta Today"
    bbox_head = draw.textbbox((0, 0), head_text, font=font_head)
    draw.text(((w - (bbox_head[2] - bbox_head[0])) // 2, 600), head_text, fill='#F8FAFC', font=font_head)
    
    # URL Badge Pill
    url_text = "https://browsernexus.com"
    bbox_url = draw.textbbox((0, 0), url_text, font=font_url)
    pw = (bbox_url[2] - bbox_url[0]) + 60
    ph = (bbox_url[3] - bbox_url[1]) + 30
    px = (w - pw) // 2
    py = 700
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=16, fill='#2563EB')
    draw.text(((w - (bbox_url[2] - bbox_url[0])) // 2, py + 14), url_text, fill='#FFFFFF', font=font_url)
    
    sub_text = "Safari • Google Chrome • Mozilla Firefox • macOS 13+"
    bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
    draw.text(((w - (bbox_sub[2] - bbox_sub[0])) // 2, 800), sub_text, fill='#94A3B8', font=font_sub)
    
    out_path = os.path.join(VIDEO_DIR, 'outro_card_1080p.png')
    img.save(out_path, format='PNG')
    print(f"✓ Created Outro Card: {out_path}")
    return out_path

# 3. Generate High-Quality Voiceover using macOS Speech Engine
def generate_voiceovers():
    script_sections = [
        ("vo_01_hook.aiff", "Tired of tiny, unreadable browser text every time you plug into a 4K monitor?"),
        ("vo_02_intro.aiff", "Meet browserNexus: the display-aware control panel for Safari, Chrome, and Firefox."),
        ("vo_03_baseline.aiff", "Set custom default zoom levels for each monitor, so your pages scale automatically without manual adjustments."),
        ("vo_04_rules.aiff", "Create powerful Zoom Rules for specific websites, like locking design tools to 100% while scaling reading sites to 125%."),
        ("vo_05_cta.aiff", "Take control of your browser scaling today. Download the free beta at browsernexus.com.")
    ]
    
    voice = "Samantha" # High quality natural voice on macOS
    
    audio_files = []
    for filename, text in script_sections:
        out_audio = os.path.join(VIDEO_DIR, filename)
        cmd = ["say", "-v", voice, "-r", "175", "-o", out_audio, text]
        subprocess.run(cmd, check=True)
        audio_files.append(out_audio)
        print(f"✓ Generated Voiceover Segment: {filename}")
        
    # Combine audio files with FFmpeg
    concat_list_path = os.path.join(VIDEO_DIR, "audio_concat.txt")
    with open(concat_list_path, "w") as f:
        for audio in audio_files:
            f.write(f"file '{audio}'\n")
            
    full_audio_wav = os.path.join(VIDEO_DIR, "voiceover_full.wav")
    full_audio_mp3 = os.path.join(VIDEO_DIR, "voiceover_full.mp3")
    
    cmd_concat = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list_path,
        "-ac", "2", "-ar", "44100", full_audio_wav
    ]
    subprocess.run(cmd_concat, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    cmd_mp3 = ["ffmpeg", "-y", "-i", full_audio_wav, "-b:a", "192k", full_audio_mp3]
    subprocess.run(cmd_mp3, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    print(f"✓ Combined Full Voiceover Audio: {full_audio_mp3}")
    return full_audio_mp3

# 4. Render Intro and Outro Video Clips (5 seconds each with subtle zoom animation)
def render_motion_clips(intro_img, outro_img):
    intro_mp4 = os.path.join(VIDEO_DIR, "intro_clip.mp4")
    outro_mp4 = os.path.join(VIDEO_DIR, "outro_clip.mp4")
    
    # 3-second animated intro with smooth Ken Burns zoom
    cmd_intro = [
        "ffmpeg", "-y", "-loop", "1", "-i", intro_img,
        "-vf", "zoompan=z='min(zoom+0.0008,1.06)':d=75:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080",
        "-t", "3", "-c:v", "libx264", "-pix_fmt", "yuv420p", intro_mp4
    ]
    subprocess.run(cmd_intro, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✓ Rendered Intro Video Clip: {intro_mp4}")
    
    # 4-second animated outro
    cmd_outro = [
        "ffmpeg", "-y", "-loop", "1", "-i", outro_img,
        "-vf", "zoompan=z='min(zoom+0.0006,1.04)':d=100:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080",
        "-t", "4", "-c:v", "libx264", "-pix_fmt", "yuv420p", outro_mp4
    ]
    subprocess.run(cmd_outro, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✓ Rendered Outro Video Clip: {outro_mp4}")

if __name__ == "__main__":
    print("=== Building Video #1 Assets ===")
    intro_p = generate_intro_card()
    outro_p = generate_outro_card()
    generate_voiceovers()
    render_motion_clips(intro_p, outro_p)
    print("\n🎉 All Video #1 Production Assets Ready in marketing/video/")
