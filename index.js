var fs = require("fs");

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
    callesMasUsadas(result);
    console.log(result);
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
        score: 0,
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
      const numeroDeCallesRecorridas = calleData[0];

      let tramos = [];
      calleData.forEach((tramo, i) => {
        if (i > 0 && i <= numeroDeCallesRecorridas) {
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
        numeroDeCallesRecorridas: calleData[0],
        ruta: tramos,
        tiempoMinimo: tiempoMinimo,
      })
    }
  })
}
const callesMasUsadas = (result) => {
  let callesUsadas = [];
  result.coches.forEach((coche) => {
    coche.ruta.forEach((calle) => {
      callesUsadas.push(calle);
    });
  });
  result.calles.forEach(calle => {
    let score = callesUsadas.filter(el => el === calle.nombreCalle);
    score = score.length;
    calle.score = score;
    if (score < 10) {
      return;
    }
  });
}

const simulacion1 = (result) => {
  // recoger tiempo 
  // iterar sobre el tiempo
  // en cada segundo, medir cuantos coches hay en el final de cada calle
  // poner en verde {$coches} segundos el que más tenga
}
generarResultado();
