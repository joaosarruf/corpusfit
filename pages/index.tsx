import React, { useEffect, useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import styles from '../styles/Home.module.css';
import Image from 'next/image';

interface Position {
  x: number;
  y: number;
}

interface Card {
  id: number;
  title: string;
  description: string;
  image_path: string;
  zoom_pc: number;
  zoom_mobile: number;
  position_pc: Position;
  position_mobile: Position;
}

const Home: React.FC = () => {
  const [planos, setPlanos] = useState<Card[]>([]);
  const [avisos, setAvisos] = useState<Card[]>([]);
  const [aulas, setAulas] = useState<Card[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth <= 750);
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  useEffect(() => {
    fetch('/api/cards?category=PLANOS')
      .then((response) => response.json())
      .then((data: { cards: Card[] }) => setPlanos(data.cards))
      .catch((error) => console.error('Erro ao buscar os planos:', error));

    fetch('/api/cards?category=AVISOS')
      .then((response) => response.json())
      .then((data: { cards: Card[] }) => setAvisos(data.cards))
      .catch((error) => console.error('Erro ao buscar os avisos:', error));

    fetch('/api/cards?category=AULAS')
      .then((response) => response.json())
      .then((data: { cards: Card[] }) => setAulas(data.cards))
      .catch((error) => console.error('Erro ao buscar as aulas:', error));
  }, []);

  const getSettings = (itemsLength: number) => ({
    dots: itemsLength > 1,
    infinite: itemsLength > 1,
    speed: 900,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: itemsLength > 1,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    fade: false,
    swipe: itemsLength > 1,
    arrows: itemsLength > 1,
    draggable: itemsLength > 1,
    centerMode: true, 
    centerPadding: '0px', // Remove o padding padrão do centerMode
  });

  const renderCard = (card: Card) => {
    const zoom = isMobile ? card.zoom_mobile : card.zoom_pc;
    const position = isMobile ? card.position_mobile : card.position_pc;
    const fileName = card.image_path.split('/').pop();
  
    return (
      <div key={card.id} className={styles.cardContainer}>
        {fileName && (
          <div className={styles.imageWrapper}>
            <Image
              className={styles.image}
              src={`/api/uploads/${fileName}`}
              alt={card.title}
              layout="fill"
              objectFit="cover"
              unoptimized
              style={{
                objectPosition: `${position.x}px ${position.y}px`,
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.carouselContainer}>

        {/* Carrossel de Planos */}
        <div className={styles.carousel}>
          <h2 className={styles.carouselTitle}>PLANOS</h2>
          {planos.length > 1 ? (
            <Slider {...getSettings(planos.length)}>
              {planos.map(renderCard)}
            </Slider>
          ) : (
            planos.map(renderCard)
          )}
        </div>

        {/* Carrossel de Avisos */}
        <div className={styles.carousel}>
          <h2 className={styles.carouselTitle}>AVISOS</h2>
          {avisos.length > 1 ? (
            <Slider {...getSettings(avisos.length)}>
              {avisos.map(renderCard)}
            </Slider>
          ) : (
            avisos.map(renderCard)
          )}
        </div>

        {/* Carrossel de Aulas */}
        <div className={styles.carousel}>
          <h2 className={styles.carouselTitle}>AULAS</h2>
          {aulas.length > 1 ? (
            <Slider {...getSettings(aulas.length)}>
              {aulas.map(renderCard)}
            </Slider>
          ) : (
            aulas.map(renderCard)
          )}
        </div>
      </div>
      
      {/* Rodapé */}
      <footer className={styles.footerContainer}>
        {/* <div className={styles.footerSection}>
          <h2 className={styles.footerTitle}>CorpusFit</h2>
          <p className={styles.footerTagline}>Cuidar do corpo e da mente vale a pena!</p>
        </div> */}

        <div className={styles.footerSectionMap}>
          <h3 className={styles.footerMapTitle}>Localização</h3>
          <p className={styles.footerMapText}>Veja onde estamos no mapa</p>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.573852781001!2d-37.51915728865305!3d-7.834844392153707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7a633c1fef4c8b9%3A0xf4a8506d2eabc98a!2sAcademia%20Corpus%20Fit!5e0!3m2!1spt-PT!2sbr!4v1728039226727!5m2!1spt-PT!2sbr"
            className={styles.footerMapIframe}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className={styles.footerSectionContact}>
          <h3 className={styles.footerContactTitle}>Contato</h3>
          <p className={styles.telefone}>Telefone: (87) 9198-5907</p>
          <p className={styles.email}>Email: corpusfit@gmail.com</p>
        </div>

        <div className={styles.footerSectionSocial}>
          <h3 className={styles.footerSocialTitle}>Siga-nos</h3>
          <ul className={styles.footerSocialLinks}>
            <li><a href="https://facebook.com" className={styles.footerSocialLink}>Facebook</a></li>
            <li><a href="https://instagram.com" className={styles.footerSocialLink}>Instagram</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default Home;
