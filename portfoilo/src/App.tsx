import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './App.css';

const HERO_PREFIX = 'Merhaba, ben ';
const HERO_NAME = 'Zehra Kurt';
const HERO_FULL = HERO_PREFIX + HERO_NAME;
const FORMSPREE_FORM_ID = 'xeezendj';


function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroText, setHeroText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const torusKnotRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);


  useEffect(() => {
    if (!canvasContainerRef.current) return;

 
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl') ||
        testCanvas.getContext('webgl2');
      if (!gl) {
        console.error('[Three] WebGL is not available in this browser/device.');
        return;
      }
    } catch (err) {
      console.error('[Three] WebGL capability check failed:', err);
      return;
    }

    console.log('[Three] init start');

 
    canvasContainerRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    sceneRef.current = scene;


    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    cameraRef.current = camera;


    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      canvasContainerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      console.log('[Three] renderer attached');
    } catch (err) {
      console.error('[Three] renderer creation failed:', err);
      return;
    }


    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x00ff9d,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    particlesMeshRef.current = particlesMesh;

    const torusKnotGeometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const torusKnotMaterial = new THREE.MeshBasicMaterial({
      color: 0x00b7ff,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
    scene.add(torusKnot);
    torusKnotRef.current = torusKnot;

    // Animation
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (particlesMeshRef.current) {
        particlesMeshRef.current.rotation.x += 0.0005;
        particlesMeshRef.current.rotation.y += 0.0005;
      }
      if (torusKnotRef.current) {
        torusKnotRef.current.rotation.x += 0.01;
        torusKnotRef.current.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();


    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      console.log('[Three] cleanup');
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && canvasContainerRef.current) {
        try {
          canvasContainerRef.current.removeChild(rendererRef.current.domElement);
        } catch {
     
        }
      }
      rendererRef.current?.dispose();
    };
  }, []);


  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= HERO_FULL.length) {
        setHeroText(HERO_FULL.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

 
  useEffect(() => {
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement;
      if (anchor) {
        e.preventDefault();
        if (menuOpen) {
          setMenuOpen(false);
        }
        const href = anchor.getAttribute('href');
        if (href) {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);
    return () => document.removeEventListener('click', handleSmoothScroll);
  }, [menuOpen]);

  // Scroll animations
  useEffect(() => {
    const sections = document.querySelectorAll('.section');
    const contactContainer = document.querySelector('.contact-container');

    const checkScroll = () => {
      sections.forEach((section) => {
        const sectionElement = section as HTMLElement;
        const sectionTop = sectionElement.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        const isInView = sectionTop < windowHeight * 0.75;
        if (isInView) {
          sectionElement.style.opacity = '1';
          sectionElement.style.transform = 'translateY(0)';
          if (sectionElement.id === 'contact' && contactContainer) {
            contactContainer.classList.add('contact-visible');
          }
        } else {
          if (sectionElement.id === 'contact' && contactContainer) {
            contactContainer.classList.remove('contact-visible');
          }
        }
      });
    };

    sections.forEach((section) => {
      const sectionElement = section as HTMLElement;
      sectionElement.style.opacity = '0';
      sectionElement.style.transform = 'translateY(50px)';
      sectionElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    window.addEventListener('scroll', checkScroll);
    window.addEventListener('load', checkScroll);
    checkScroll();

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('load', checkScroll);
    };
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formStatus !== 'idle') setFormStatus('idle');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    setFormError('');


    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        })
      });

      if (response.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await response.json().catch(() => ({}));
        setFormStatus('error');
        setFormError(data.error || 'Gönderim sırasında bir hata oluştu.');
      }
    } catch {
      setFormStatus('error');
      setFormError('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  };

  return (
    <>
      <div id="canvas-container" ref={canvasContainerRef}></div>

      <div className="page-content">
        <header>
          <div className="container">
            <nav>
              <a href="#" className="logo">
                Zehra Kurt
              </a>
              <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}>
                <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </div>
              <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
             
                <li>
                  <a href="#home">Ana Sayfa</a>
                </li>
                <li>
                  <a href="#about">Hakkımda</a>
                </li>
                <li>
                  <a href="#services">Hizmetler</a>
                </li>
                <li>
                  <a href="#projects">Projeler</a>
                </li>
                <li>
                  <a href="#contact">İletişim</a>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <section id="home" className="hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">
                {heroText.length <= HERO_PREFIX.length ? (
                  heroText
                ) : (
                  <>
                    {HERO_PREFIX}<span>{heroText.slice(HERO_PREFIX.length)}</span>
                  </>
                )}
                {heroText.length < HERO_FULL.length && <span className="cursor">|</span>}
              </h1>
              <p>
              Modern web teknolojileri ve React Native ile
              mobil platformlarda kullanıcı odaklı, işlevsel projeler geliştiriyorum.
              </p>
              <a href="#contact" className="btn">
                İletişime Geç
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container">
            <h2 className="section-title">Hakkımda</h2>
            <div className="about-content">
              <div className="about-text">
                <h3>Ben Kimim?</h3>
                <p>
                  Ben Zehra Kurt. Only JS Akademi'de Full Stack eğitimi aldım. Hem front-end hem
                  back-end tarafında güzel ve işlevsel web uygulamaları geliştirmeye odaklanıyorum.
                </p>
                <p>
                  Web geliştirme yolculuğuma Full Stack eğitimiyle başladım; modern teknolojilerle
                  küçük işletme sitelerinden karmaşık web uygulamalarına kadar projeler üzerinde
                  çalışıyorum.
                </p>
                <p>
                  React Native ile iOS ve Android platformları için mobil uygulamalar geliştiriyorum.
                  Tek kod tabanıyla her iki platformda çalışan, performanslı ve modern mobil deneyimler sunuyorum.
                </p>
                <p>
                  Aynı zamanda e-ticaret ve SEO uzmanlığı yapıyorum.
                </p>

                <div className="skills">
                  <span className="skill">HTML5</span>
                  <span className="skill">CSS3</span>
                  <span className="skill">JavaScript</span>
                  <span className="skill">React</span>
                  <span className="skill">React Native</span>
                  <span className="skill">Node.js</span>
                  <span className="skill">Express</span>
                  <span className="skill">MongoDB</span>
                  <span className="skill">UI/UX Design</span>
                  <span className="skill">Responsive Design</span>
                  <span className="skill">Mobil Geliştirme</span>
                  <span className="skill">Next.js</span>
                </div>
              </div>

              <div className="about-cube">
                <div className="cube">
                  <div className="face front">
                    <i className="fas fa-code"></i>
                  </div>
                  <div className="face back">
                    <i className="fas fa-laptop-code"></i>
                  </div>
                  <div className="face right">
                    <i className="fas fa-paint-brush"></i>
                  </div>
                  <div className="face left">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <div className="face top">
                    <i className="fas fa-database"></i>
                  </div>
                  <div className="face bottom">
                    <i className="fas fa-server"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="section services">
          <div className="container">
            <h2 className="section-title">Hizmetlerim</h2>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-code"></i>
                </div>
                <h3>Web Geliştirme</h3>
                <p>
                  Modern teknolojiler ve en iyi uygulamalarla responsive, hızlı ve ölçeklenebilir
                  web siteleri ve uygulamaları geliştiriyorum.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-paint-brush"></i>
                </div>
                <h3>UI/UX Tasarım</h3>
                <p>
                  Kullanıcı deneyimini artıran, sade ve etkileyici arayüzler tasarlıyorum.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h3>Mobil Uygulama Geliştirme</h3>
                <p>
                  React Native ile iOS ve Android için tek kod tabanından çapraz platform mobil
                  uygulamalar geliştiriyorum.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-desktop"></i>
                </div>
                <h3>Responsive Tasarım</h3>
                <p>
                  Web sitenizin masaüstünden akıllı telefona kadar tüm cihazlarda mükemmel
                  görünmesini ve çalışmasını sağlıyorum.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-search-dollar"></i>
                </div>
                <h3>SEO Optimizasyonu</h3>
                <p>
                  Arama motorlarında daha görünür olmanız için sitenizi optimize ediyorum.
                </p>
              </div>

              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-tachometer-alt"></i>
                </div>
                <h3>Performans Optimizasyonu</h3>
                <p>
                  Sitenizi daha hızlı ve verimli hale getirerek kullanıcı deneyimini iyileştiriyorum.
                </p>
              </div>

            </div>
          </div>
        </section>

        <section id="projects" className="section">
          <div className="container">
            <h2 className="section-title">Projelerim</h2>
            <div className="projects-grid">
              <div className="project-card">
                <div className="project-content">
                  <h3>İsterim Kooperatif Tanıtım Sitesi</h3>
                  <p>
                  Kullanıcıların kooperatifin yapısı ve faaliyetleri hakkında kolayca bilgi edinebilmesini hedefleyen, içerik odaklı bir tanıtım sitesidir.
                  </p>
                  <div className="project-tech">
                    <span className="tech">React</span>
                    <span className="tech">TypeScript</span>
                    <span className="tech">Vite</span>
                    <span className="tech">Css</span>
                  </div>
                  <div className="project-links">
                    <a   href="https://isterimkoop.org.tr/" target="_blank">
                      <i className="fas fa-external-link-alt"></i> Canlı Demo
                    </a>
                    <a href="https://github.com/zehrakurt/isterim_koop.git" target="_blank">
                      <i className="fab fa-github"></i> Kaynak Kod
                    </a>
                  </div>
                </div>
              </div>

              <div className="project-card">
                <div className="project-content">
                  <h3>FitCart E-Commerce</h3>
                  <p>
                  Sporcu gıdaları ve vitamin satışı için tasarlanmış kapsamlı bir B2C e-ticaret web uygulamasıdır. İçerisinde güvenli üyelik sistemi, detaylı ürün filtreleme, varyantlı (aroma/boyut) sepet yönetimi ve müşteri yorumları gibi gerçek dünya senaryolarına uygun gelişmiş e-ticaret akışları barındırmaktadır.
                  </p>
                  <div className="project-tech">
                    <span className="tech">React</span>
                    <span className="tech">TypeScript</span>
                    <span className="tech">Tailwind CSS</span>
                  </div>
                  <div className="project-links">
                    <a href="https://nutrition61.netlify.app/">
                      <i className="fas fa-external-link-alt"></i> Canlı Demo
                    </a>
                    <a href="https://github.com/zehrakurt/final-project.git">
                      <i className="fab fa-github"></i> Kaynak Kod
                    </a>
                  </div>
                </div>
              </div>

              <div className="project-card">
                <div className="project-content">
                  <h3>Portfolyo Şablonu</h3>
                  <p>
                    3D animasyonlar ve karanlık mod ile geliştiriciler için özelleştirilebilir
                    portfolyo şablonu.
                  </p>
                  <div className="project-tech">
                    <span className="tech">HTML/CSS</span>
                    <span className="tech">JavaScript</span>
                    <span className="tech">Three.js</span>
                    <span className="tech">GSAP</span>
                  </div>
                  <div className="project-links">
                    <a href="#">
                      <i className="fas fa-external-link-alt"></i> Canlı Demo
                    </a>
                    <a href="#">
                      <i className="fab fa-github"></i> Kaynak Kod
                    </a>
                  </div>
                </div>
              </div>

              <div className="project-card">
                <div className="project-content">
                  <h3>Görev Yönetim Uygulaması</h3>
                  <p>
                    Sürükle-bırak ve ekip iş birliği özellikleriyle görev yönetimi uygulaması.
                  </p>
                  <div className="project-tech">
                    <span className="tech">Vue.js</span>
                    <span className="tech">Firebase</span>
                    <span className="tech">Tailwind CSS</span>
                  </div>
                  <div className="project-links">
                    <a href="#">
                      <i className="fas fa-external-link-alt"></i> Canlı Demo
                    </a>
                    <a href="#">
                      <i className="fab fa-github"></i> Kaynak Kod
                    </a>
                  </div>
                </div>
              </div>

              <div className="project-card">
                <div className="project-content">
                  <h3>Hava Durumu Paneli</h3>
                  <p>
                    Çeşitli API'lerden veri alarak anlık durum ve tahminleri gösteren hava durumu
                    uygulaması.
                  </p>
                  <div className="project-tech">
                    <span className="tech">React</span>
                    <span className="tech">OpenWeather API</span>
                    <span className="tech">Chart.js</span>
                  </div>
                  <div className="project-links">
                    <a href="#">
                      <i className="fas fa-external-link-alt"></i> Canlı Demo
                    </a>
                    <a href="#">
                      <i className="fab fa-github"></i> Kaynak Kod
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section contact">
          <div className="container">
            <h2 className="section-title">İletişim</h2>
            <div className="contact-container">
              <div className="contact-info">
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="contact-text">
                    <h3>Konum</h3>
                    <p>Türkiye</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="contact-text">
                    <h3>E-posta</h3>
                    <a href="zehrakurrt7@gmail.com">zehrakurrt7@gmail.com</a>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div className="contact-text">
                    <h3>Telefon</h3>
                    <a href="tel:+905551234567">+90 506 172 12 48</a>
                  </div>
                </div>

             
              </div>

              <div className="contact-form">
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Adınız</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">E-posta Adresiniz</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Konu</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="form-control"
                      value={formData.subject}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Mesajınız</label>
                    <textarea
                      id="message"
                      name="message"
                      className="form-control"
                      value={formData.message}
                      onChange={handleFormChange}
                      required
                    ></textarea>
                  </div>

                  {formStatus === 'success' && (
                  <p className="form-success">
                    <i className="fas fa-check-circle"></i> Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağım.
                  </p>
                )}
                {formStatus === 'error' && (
                  <p className="form-error">
                    <i className="fas fa-exclamation-circle"></i> {formError}
                  </p>
                )}
                  <button type="submit" className="btn" disabled={formStatus === 'loading'}>
                    {formStatus === 'loading' ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Gönderiliyor...
                      </>
                    ) : (
                      'Mesajınızı Gönderin'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="container">
            <div className="social-links">
              <a href="https://github.com/zehrakurt" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/zehrakurrtt/" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-dribbble"></i>
              </a>
            </div>
            <p className="copyright">© 2026 Zehra Kurt. Tüm hakları saklıdır.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;