// configuracion para que supabase tome bien los contenidos

const SUPABASE_URL = "https://btbfhfcmuvfimvbncjyy.supabase.co";

const SUPABASE_KEY = "sb_publishable_f2E3G61IPBCchz5MmwjgJA_XXjsMkwQ";

const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// estos son los elementos de la pagina

const inputMensaje = document.getElementById("mensaje");

const botonPublicar = document.getElementById("botonPublicar");

const foro = document.getElementById("foro");


// esto funciona para publicar

async function publicar() {

    const texto = inputMensaje.value.trim();

    if (texto === "") {
        alert("Escribí un mensaje.");
        return;
    }

    botonPublicar.disabled = true;

    const { error } = await db
        .from("mensajes")
        .insert({
            texto: texto
        });

    if (error) {

        console.error("Error:", error);

        alert("No se pudo publicar el mensaje.");

        botonPublicar.disabled = false;

        return;
    }

    inputMensaje.value = "";

    botonPublicar.disabled = false;

    cargarMensajes();
}


// esto carga los mensajes

async function cargarMensajes() {

    const { data, error } = await db
        .from("mensajes")
        .select("id, texto, creado_en")
        .order("creado_en", {
            ascending: false
        });


    if (error) {

        console.error("Error:", error);

        foro.innerHTML =
            "<p>No se pudieron cargar los mensajes.</p>";

        return;
    }


    foro.innerHTML = "";


    data.forEach(function (mensaje) {

        const contenedor = document.createElement("div");

        contenedor.className = "mensaje";


        // texto del mensaje

        const texto = document.createElement("div");


        // si tiene mas de 100 caracteres

        if (mensaje.texto.length > 100) {

            const textoCorto = document.createElement("span");

            textoCorto.textContent =
                mensaje.texto.substring(0, 100) + "... ";


            const botonLeer = document.createElement("button");

            botonLeer.textContent = "Leer más";


            botonLeer.addEventListener("click", function () {

                texto.innerHTML = "";

                const textoCompleto =
                    document.createElement("span");

                textoCompleto.textContent = mensaje.texto;


                const botonCerrar =
                    document.createElement("button");

                botonCerrar.textContent = "Leer menos";


                botonCerrar.addEventListener("click", function () {

                    texto.innerHTML = "";

                    texto.appendChild(textoCorto);

                    texto.appendChild(botonLeer);

                });


                texto.appendChild(textoCompleto);

                texto.appendChild(botonCerrar);

            });


            texto.appendChild(textoCorto);

            texto.appendChild(botonLeer);

        } else {

            // si tiene 100 caracteres o menos

            texto.textContent = mensaje.texto;

        }


        // fecha

        const fecha = document.createElement("span");

        fecha.className = "fecha";

        fecha.textContent =
            new Date(mensaje.creado_en).toLocaleString();


        contenedor.appendChild(texto);

        contenedor.appendChild(fecha);

        foro.appendChild(contenedor);

    });
}


// funcion del boton

botonPublicar.addEventListener(
    "click",
    publicar
);


// apretar enter para publicar

inputMensaje.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Enter") {

            publicar();

        }

    }
);


// esto carga el mensaje al entrar

cargarMensajes();


// esto actualiza el foro cada 3 segundos

setInterval(
    cargarMensajes,
    3000
);