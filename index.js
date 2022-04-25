var fs = require("fs");
const { createSecureContext } = require("tls");

function generarResultado() {
  const result = {};

  fs.readFile("a.txt", "utf8", function (err, data) {
    var lines = data.split("\n");
    lines.forEach((line, i) => {
      const element = line.split(' ');
      if (i === 0) {
        result.duracion = element[0];
        result.intersecciones = element[1];
        result.numeroCalles = element[2];
        result.numeroCoches = element[3];
        result.puntosExtra = element[4];
      }
    })
    parseCallesToJson(lines, result);
    parseCochesToJson(lines, result);
    parseCrucesToJson(result);
    // callesMasUsadas(result);
    // console.log(result);
    simulacion1(result);
  });
}

const parseCallesToJson = (data, result) => {
  const { numeroCalles } = result;
  result.calles = [];
  data.forEach((calle, i) => {
    if (i > 0 && i <= numeroCalles) {
      const calleData = calle.split(' ');

      result.calles.push({
        principioDeCalle: calleData[0],
        finalDeCalle: calleData[1],
        nombreCalle: calleData[2],
        tiempoDeViaje: calleData[3],
        cochesEnElSemaforo: [],
        cochesEnElRecorrido: [],
        luzVerde: false
      })
    }
  })
}

const parseCochesToJson = (data, result) => {
  let { numeroCalles } = result;
  numeroCalles = parseInt(numeroCalles);
  result.coches = [];
  data.forEach((calle, i) => {
    if (i >= numeroCalles + 1) {
      const calleData = calle.split(' ');
      const callesPorRecorrer = calleData[0];

      let tramos = [];
      calleData.forEach((tramo, i) => {
        if (i > 0 && i <= callesPorRecorrer) {
          tramos.push(tramo);
        }
      })

      let tiempoMinimo = 0;
      result.calles.forEach(c => {
        tramos.forEach(t => {
          if (t === c.nombreCalle) {
            tiempoMinimo = tiempoMinimo + parseInt(c.tiempoDeViaje);
          }
        });
      });

      result.coches.push({
        callesPorRecorrer: calleData[0],
        ruta: tramos,
        tiempoMinimo: tiempoMinimo,
        posicionEnLaRuta: 0,
        tiempoRecorridoEnLaCalle: 0
      })
    }
  })
}

const parseCrucesToJson = (result) => {
  let cruces = [];
  result.cruces = []

  result.calles.forEach(calle => {
    cruces.push({
      id: calle.finalDeCalle,
      callesEntrantes: [calle.nombreCalle],
      calleConMasCoches: {
        calle: "",
        cochesEnEstaCalle: 0
      }
    })
  });

  result.calles.forEach(calle => {
    cruces.forEach(cruce => {
      if (cruce.id === calle.finalDeCalle) {
        if (cruce.callesEntrantes.includes(calle.nombreCalle) === false) {
          cruce.callesEntrantes.push(calle.nombreCalle);
        }
      }
    });
  });

  var hash = {};
  cruces = cruces.filter(function (current) {
    var exists = !hash[current.id];
    hash[current.id] = true;
    return exists;
  });

  cruces.forEach(cruce => {
    result.cruces.push(cruce);
  });
}

// const callesMasUsadas = (result) => {
//   let callesUsadas = [];
//   result.coches.forEach((coche) => {
//     coche.ruta.forEach((calle) => {
//       callesUsadas.push(calle);
//     });
//   });
//   result.calles.forEach(calle => {
//     let score = callesUsadas.filter(el => el === calle.nombreCalle);
//     score = score.length;
//     calle.score = score;
//     if (score < 10) {
//       return;
//     }
//   });
// }

const simulacion1 = (result) => {
  let score = 0;
  let callesConMasCoches = [];
  let output = [];

  // llenar un array con los coches que estan en el semaforo de cada calle
  result.calles.forEach(calle => {
    result.coches.forEach(coche => {
      if (calle.nombreCalle === coche.ruta[0]) {
        calle.cochesEnElSemaforo.push(coche);
      }
    });
  });
  // hacer una serie de cosas cada segundo de la simulacion 
  for (tiempo = 0; tiempo < result.duracion; tiempo++) {
    // contar los coches que hay en cada calle
    result.calles.forEach(calle => {
      let cochesEnElSemaforo = calle.cochesEnElSemaforo.length;
      let cochesEnElRecorrido = calle.cochesEnElRecorrido.length;
      let cochesEnEstaCalle = cochesEnElSemaforo + cochesEnElRecorrido;
      callesConMasCoches.push({
        calle: calle.nombreCalle,
        cochesEnEstaCalle: cochesEnEstaCalle
      })
    })
    // abrir las calles que mas coches tengan de cada interseccion si no estan ya abiertos y cerrar el que no
    result.cruces.forEach(cruce => {
      callesConMasCoches.forEach(calleConMasCoches => {
        result.calles.forEach(calle => {
          if (cruce.calleConMasCoches.cochesEnEstaCalle < calleConMasCoches.cochesEnEstaCalle && cruce.callesEntrantes.includes(calleConMasCoches.calle) === true) {
            cruce.calleConMasCoches = calleConMasCoches
          }
          if (cruce.calleConMasCoches.calle === calle.nombreCalle) {
            calle.luzVerde = true;
          }
          if (cruce.calleConMasCoches.calle !== calle.nombreCalle) {
            calle.luzVerde = false;
          }
        });
      });
    });
    // registrar en el output las calles que abres nuevas y sumar 1 segundo a las calle que ya estan abiertas
    // result.cruces.forEach(cruce => {
    //   if (cruce.calleConMasCoches.calle !== "") {
    //     output.push({
    //       cruce: cruce.id,
    //       calle: cruce.calleConMasCoches.calle,
    //       tiempoAbierto: 1
    //     })
    //   }
    // });
    // tener en cuenta que solo se puede nombrar una calle una vez y que se va repetir el ciclo de lo que esté apuntado en cada interseccion

    // mover los coches =>
    // sumar 1 al tiempo de recorrido de los coches que esten recorriendo la calle
    result.calles.forEach(calle => {
      calle.cochesEnElRecorrido.forEach(cocheEnElRecorrido => {
        cocheEnElRecorrido.tiempoRecorridoEnLaCalle = cocheEnElRecorrido.tiempoRecorridoEnLaCalle + 1;
      });
    });
    // meter los coches que acaban de salir en el array de los que estan recorriendo la calle a la que entran
    // quitar el primero de la cola de las calles con el semaforo abierto
    // sumar 1 a la posicion en la ruta de los coches entran a una nueva calle
    result.calles.forEach(calle => {
      result.coches.forEach(coche => {
        if (calle.luzVerde = true && calle.cochesEnElSemaforo[0] == coche) {
          coche.posicionEnLaRuta = coche.posicionEnLaRuta + 1;
          calle.cochesEnElSemaforo.splice(0, 1)
        }
        if (calle.nombreCalle == coche.ruta[coche.posicionEnLaRuta] && calle.cochesEnElRecorrido.includes(coche) == false) {
          calle.cochesEnElRecorrido.push(coche);
        }
      });
    });
    // a los coches que ya han llegado a los segundos que se tarda en recorrer esa calle, meterlos en la cola del semaforo 
    // borrar los coches que hayan llegado al ultimo punto de la ruta 
    // sumar el score de esos coches (numero de coches que han llegado x(puntosExtra+(duracion-tiempo))) 
  }
}

generarResultado();

