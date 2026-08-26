# END USER LICENSE AGREEMENT (EULA)

**Last Updated:** August 23, 2026  
**Product:** browserNexus (formerly macZoomConductor)  
**Author / Licensor:** Nick Lee (bricolageTheory) <coolnickldd@gmail.com>

---

**PLEASE READ THIS END USER LICENSE AGREEMENT ("AGREEMENT" OR "EULA") CAREFULLY BEFORE DOWNLOADING, INSTALLING, OR USING BROWSERNEXUS (THE "SOFTWARE"). BY DOWNLOADING, INSTALLING, COPYING, OR OTHERWISE USING THE SOFTWARE, YOU AGREE TO BE BOUND BY THE TERMS AND CONDITIONS OF THIS AGREEMENT. IF YOU DO NOT AGREE TO THE TERMS OF THIS AGREEMENT, DO NOT DOWNLOAD, INSTALL, OR USE THE SOFTWARE.**

---

### 1. GRANT OF LICENSE
Subject to the terms and conditions of this Agreement, Licensor grants you a non-exclusive, non-transferable, revocable, limited license to download, install, and execute the Software on compatible Apple macOS devices that you own or control, solely for your personal or internal business purposes.

### 2. ARCHITECTURAL SCOPE & SYSTEM PERMISSIONS
The Software consists of:
1. A native macOS host application ("Host Application");
2. Native browser extensions for Safari, Google Chrome, Mozilla Firefox, and compatible Chromium browsers ("Browser Extensions");
3. Local Inter-Process Communication (IPC) relays and UNIX domain sockets.

To perform multi-display zoom orchestration, persistent window management, and tab switching, the Software requests and utilizes local macOS system permissions, including:
- **Accessibility API (AX) Permissions:** Used exclusively to inspect browser window bounds, detect multi-monitor migrations, and programmatically adjust window positioning.
- **Native Messaging Host Permissions:** Used strictly for low-latency local stdio IPC between the Host Application and Browser Extensions.

### 3. PRIVACY AND LOCAL-FIRST DATA PROCESSING
The Software is designed with a **100% local-first privacy architecture**:
- The Software does **not** collect, store, transmit, or monitor your web browsing history, web page contents, cookies, passwords, or personal credentials.
- All IPC messaging occurs exclusively on local UNIX domain sockets and local stdio pipes (`localhost`).
- Display layout metadata, zoom preferences, and window naming tags are persisted exclusively on your local machine (`~/Library/Application Support/com.zoomconductor.app`).

---

### 4. "AS-IS" AND "NO WARRANTY" DISCLAIMER

**THE SOFTWARE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITH ALL FAULTS, DEFECTS, AND ERRORS, AND WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE.**

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LICENSOR AND ITS CONTRIBUTORS EXPRESSLY DISCLAIM ALL WARRANTIES, GUARANTEES, CONDITIONS, AND REPRESENTATIONS OF ANY KIND, WHETHER ORAL OR WRITTEN, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO:
1. **IMPLIED WARRANTIES OF MERCHANTABILITY, SATISFACTORY QUALITY, AND FITNESS FOR A PARTICULAR PURPOSE;**
2. **WARRANTIES OF TITLE AND NON-INFRINGEMENT OF THIRD-PARTY INTELLECTUAL PROPERTY RIGHTS;**
3. **WARRANTIES THAT THE SOFTWARE WILL OPERATE UNINTERRUPTED, SECURE, ACCURATE, COMPLETE, FREE FROM HARMFUL CODE, OR ERROR-FREE;**
4. **WARRANTIES THAT THE SOFTWARE WILL BE COMPATIBLE OR INTEROPERABLE WITH FUTURE OPERATING SYSTEM RELEASES (INCLUDING MACOS UPDATES), THIRD-PARTY BROWSERS (SAFARI, CHROME, FIREFOX), OR HARDWARE CONFIGURATIONS;**
5. **WARRANTIES REGARDING THE ACCURACY, RELIABILITY, TIMELINESS, OR PERFORMANCE OF DISPLAY SCALING, ZOOM ADJUSTMENT, OR TAB STATE RESTORATION.**

YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT USE OF THE SOFTWARE IS AT YOUR SOLE AND EXCLUSIVE RISK, AND THAT THE ENTIRE RISK AS TO SATISFACTORY QUALITY, PERFORMANCE, ACCURACY, AND EFFORT RESTS ENTIRELY WITH YOU.

---

### 5. LIMITATION OF LIABILITY

TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LICENSOR, ITS AFFILIATES, CONTRIBUTORS, DIRECTORS, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY:
- **DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES WHATSOEVER;**
- **LOSS OF PROFITS, REVENUE, DATA, GOODWILL, WORK STOPPAGE, OR SYSTEM DOWNTIME;**
- **COMPUTER FAILURE, MALFUNCTION, HARDWARE CONFLICTS, DISPLAY GLITCHES, OR DATA CORRUPTION;**
- **BROWSER TAB CRASHES, UNINTENTIONAL TAB CLOSURES, OR LOSS OF SESSION STATE;**

ARISING OUT OF OR IN CONNECTION WITH THE USE OF, INABILITY TO USE, RELIANCE ON, OR PERFORMANCE OF THE SOFTWARE, REGARDLESS OF THE THEORY OF LIABILITY (WHETHER IN CONTRACT, TORT, STRICT LIABILITY, NEGLIGENCE, OR OTHERWISE), EVEN IF LICENSOR HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

IF APPLICABLE JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, LICENSOR'S TOTAL AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL BE LIMITED TO THE AMOUNT ACTUALLY PAID BY YOU (IF ANY) FOR THE SOFTWARE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR FIVE US DOLLARS ($5.00 USD), WHICHEVER IS LESS.

---

### 6. RESTRICTIONS AND PROHIBITED CONDUCT
You agree that you will not:
- Modify, adapt, translate, reverse engineer, decompile, disassemble, or derive the source code of any proprietary components of the Software, except to the extent permitted by applicable open-source licenses or mandatory law;
- Rent, lease, lend, sell, sublicense, distribute, or host the Software as a managed commercial service without prior written authorization;
- Use the Software for any unlawful purpose, in violation of any applicable local, national, or international regulation, or to infringe upon the rights of any third party.

---

### 7. UPDATES AND MODIFICATIONS
Licensor may, at its sole discretion, provide maintenance releases, bug fixes, features, or updates to the Software. Licensor has no obligation to provide ongoing maintenance, support, or updates. This Agreement shall govern any updates provided by Licensor, unless superseded by an updated agreement.

### 8. TERMINATION
This Agreement is effective until terminated. Your rights under this License will terminate automatically without notice if you fail to comply with any of its terms. Upon termination, you must immediately cease all use of the Software and permanently delete all copies in your possession.

### 9. SEVERABILITY AND GOVERNING LAW
If any provision of this Agreement is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. This Agreement shall be governed by and construed in accordance with the laws of the State of California, United States, excluding its conflict of laws principles and the United Nations Convention on Contracts for the International Sale of Goods.

---

### 10. CONTACT INFORMATION
For legal inquiries, licensing questions, or notice under this Agreement, please contact:

**Nick Lee (bricolageTheory)**  
Email: `coolnickldd@gmail.com`  
Website: `https://browsernexus.com`
Support: `https://browsernexus.com/support/`
