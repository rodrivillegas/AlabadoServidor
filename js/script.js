const firebaseConfig = {
  apiKey: "AIzaSyDYoPl8tTmHs1skLtP264ooxE4xEiWGh2w",
  authDomain: "pedidoslablonda.firebaseapp.com",
  projectId: "pedidoslablonda",
};

// Inicializar la aplicación de Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();

// Obtén la referencia al cuerpo de la tabla
var tablaBody = document.getElementById("tablaBody");

// Variable global para almacenar las filas
var filas = [];

// Recuperar el estado de selección de las filas desde Firebase y actualizar la tabla
database.ref().on("value", function (snapshot) {
  var datos = snapshot.val();

  // Vaciar el cuerpo de la tabla
  tablaBody.innerHTML = "";

  // Limpiar el array de filas
  filas = [];

  // Recorrer los datos y agregar filas a la tabla
  for (var key in datos) {
    // Filtrar el elemento "fila" no deseado
    if (key === "fila") {
      continue; // Saltar al siguiente elemento
    }

    var fila = datos[key];
    var detallesPedido = fila.detallesPedido;

    var detallesHtml = "";
    if (Array.isArray(detallesPedido)) {
      detallesPedido.forEach(function (detalles) {
        var nombre = detalles.nombre;
        var cantidad = detalles.cantidad;

        detallesHtml += `${cantidad}x ${nombre}<br>`;
      });
    }

    fila.detallesHtml = detallesHtml;
    filas.push(fila);
  }

  // Generar filas HTML
  var filasHtml = ""; // Variable para almacenar las filas generadas

  filas.forEach(function (fila, index) {
    var selectedClass = fila.seleccionada ? "selected" : "";
    var completedClass = fila.completada ? "" : "uncompleted"; // Agregar la clase "uncompleted" si la fila no está completada

    var filaHtml = `
      <tr id="fila-${index}" class="${selectedClass} ${completedClass}" onclick="seleccionarFila(${index})">
        <td>${fila.fecha}</td>
        <td>${fila.hora}</td>
        <td>${fila.nombreUsuario}</td>
        <td>${fila.numeroMesa}</td>
        <td>${fila.detallesHtml}</td>
        <td>${fila.comentarios}</td>
      </tr>
    `;
    filasHtml += filaHtml; // Agregar la fila generada a la cadena de filas
  });

  tablaBody.innerHTML = filasHtml; // Establecer el contenido de la tabla

  // Restaurar el estado de las filas desde el almacenamiento local
  restaurarEstadoFilas();
});

// Función para seleccionar una fila y marcarla como completada o no completada
function seleccionarFila(index) {
  var fila = filas[index];

  // Invierte el estado de completada al hacer clic en la fila
  fila.completada = !fila.completada;

  // Guardar el estado actualizado en el almacenamiento local
  guardarEstadoFilas();

  // Obtiene el elemento de la fila correspondiente
  var filaElement = document.getElementById(`fila-${index}`);

  // Agrega o elimina la clase "completed" según el estado de completada
  filaElement.classList.toggle("completed", fila.completada);
  // Agrega o elimina la clase "uncompleted" según el estado de completada
  filaElement.classList.toggle("uncompleted", !fila.completada);
}

// Función para guardar el estado de las filas en el almacenamiento local
function guardarEstadoFilas() {
  var estadoFilas = filas.map(function (fila) {
    return {
      completada: fila.completada,
    };
  });

  localStorage.setItem("filas", JSON.stringify(estadoFilas));
}

// Función para restaurar el estado de las filas desde el almacenamiento local
function restaurarEstadoFilas() {
  var estadoFilas = localStorage.getItem("filas");

  if (estadoFilas) {
    var estadoFilasParsed = JSON.parse(estadoFilas);

    estadoFilasParsed.forEach(function (estadoFila, index) {
      filas[index].completada = estadoFila.completada;

      var filaElement = document.getElementById(`fila-${index}`);
      var descripcionElement = filaElement.querySelector(".descripcion");

      if (!estadoFila.completada) {
        filaElement.classList.remove("completed"); // Eliminar la clase "completed" si la fila no está completada
        filaElement.classList.add("uncompleted"); // Agregar la clase "uncompleted" a las filas no completadas
      } else {
        filaElement.classList.remove("uncompleted"); // Eliminar la clase "uncompleted" si la fila está completada
        filaElement.classList.add("completed"); // Agregar la clase "completed" a las filas completadas
      }
    });
  } else {
    // Si no hay datos en el almacenamiento local, establecer todas las filas como completadas y guardar el estado inicial
    filas.forEach(function (fila) {
      fila.completada = true;
    });

    guardarEstadoFilas();
  }

  // Actualizar la visualización de la tabla
  filas.forEach(function (fila, index) {
    var filaElement = document.getElementById(`fila-${index}`);
    filaElement.classList.toggle("uncompleted", !fila.completada);
  });
}

// Ordena las filas de la tabla por la hora del pedido
function ordenarTablaPorHora() {
  var filas = Array.from(tablaBody.getElementsByTagName("tr"));

  // Ordena las filas según la hora del pedido (considerando formato HH:MM:SS)
  filas.sort(function (a, b) {
    var horaA = obtenerHoraPedido(a);
    var horaB = obtenerHoraPedido(b);

    return horaA.localeCompare(horaB);
  });

  // Vuelve a agregar las filas a la tabla en el nuevo orden
  filas.forEach(function (fila) {
    tablaBody.appendChild(fila);
  });
}

// Obtén la hora del pedido de una fila
function obtenerHoraPedido(fila) {
  var celdaHora = fila.querySelector("td:nth-child(2)");
  return celdaHora.textContent;
}
