import { IProyect } from '../interfaces';

export const PROYECTS: IProyect[] = [
  {
    year: 2021,
    coverImgSrc: 'assets/images/proyects/pbcinteract.png',
    name: 'PBC Interact',
    description:
      'Juego de preguntas médicas con varios niveles que mostraban distintas problemáticas de enfermedades renales simulando la consulta de un médico. Actualmente desactivada.',
    url: 'https://pbcinteract.com/'
  },
  {
    year: 2024,
    coverImgSrc: 'assets/images/proyects/laligabares.png',
    name: 'LALIGA Bares',
    description:
      'CRM y portal web para "La Liga" en el que se muestran (entre otros) datos sobre bares o casinos que tienen contratado un paquete de fútbol que no corresponde a su negocio. Este portal tiene un login así que la información que se puede mostrar es muy limitada.',
    url: 'https://laligabares.my.salesforce.com/'
  },
  {
    year: 2022,
    coverImgSrc: 'assets/images/proyects/discamino.png',
    name: 'Discamino',
    description:
      'Web interna que gestiona fechas y conexiones entre conductores, vehículos y acompañantes de una empresa dedicada a entrenar y acompañar a personas con diversidad funcional a hacer el camino de Santiago. Esta web necesita de logueo así que la información que se puede mostrar es limitada.',
    url: 'https://team.discamino.org/#/login'
  },
  {
    year: 2022,
    coverImgSrc: 'assets/images/proyects/pharmachallenge.png',
    name: 'Pharma Challenge',
    description:
      'Concurso farmacéutico que consta de varias fases. En la fase final, los participantes deben enviar un video explicando su proyecto. El ganador de este concurso, recibe una subvención para hacer realidad el proyecto en si. Esta web tiene un login ya que se accede a este concurso con invitación.',
    url: 'https://pharmachallenge.es/'
  },
  {
    year: 2022,
    coverImgSrc: 'assets/images/proyects/dfg.png',
    name: 'DFG',
    description:
      'Web dedicada a la empresa DFG Natural Stone a través de la que se puede acceder a la web de compras, también desarrollada por el equipo en el que trabajaba ese año.',
    url: 'https://web.dfg.es/'
  },
  {
    year: 2025,
    coverImgSrc: 'assets/images/proyects/hermes.jpg',
    name: 'Hermes',
    description:
      'Web interna que gestiona los transportes de materiales vía tren de la empresa Arcelor Mittal. Al ser una web interna, no es accesible para el público común.'
  }
];
