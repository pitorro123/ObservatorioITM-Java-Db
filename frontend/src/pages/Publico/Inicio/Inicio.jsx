import Hero from "../../../components/publico/Home/Hero/Hero.jsx";
import ObservatoryStatus from "../../../components/publico/Home/ObservatoryStatus/ObservatoryStatus.jsx";
import FeaturedEvent from "../../../components/publico/Home/FeaturedEvent/FeaturedEvent.jsx";
import WhyAttend from "../../../components/publico/Home/WhyAttend/WhyAttend.jsx";
import InformationCards from "../../../components/publico/Home/InformationCards/InformationCards.jsx";
import Gallery from "../../../components/publico/Home/Gallery/Gallery.jsx";
import estilos from "./Inicio.module.css";

export default function Inicio() {
  return (
    <>
      <Hero />
      <div className={estilos.statusWrapper}>
        <ObservatoryStatus />
      </div>

      <section className={estilos.featuredSection}>
        <div className={estilos.featuredHeader}>
          <div className={estilos.featuredBanner}>Próximo Evento Destacado</div>
        </div>

        <div className={estilos.featuredGrid}>
          <FeaturedEvent />
          <WhyAttend />
        </div>
      </section>

      <InformationCards />
      <Gallery />
    </>
  );
}