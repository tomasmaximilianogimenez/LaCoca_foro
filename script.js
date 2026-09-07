const SUPABASE_URL =
    "https://btbfhfcmuvfimvbncjyy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_f2E3G61IPBCchz5MmwjgJA_XXjsMkwQ";

const db =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


const inputMensaje =
    document.getElementById("mensaje");

const botonPublicar =
    document.getElementById("botonPublicar");

const foro =
    document.getElementById("foro");

const botonGoogle =
    document.getElementById("botonGoogle");

const botonCerrarSesion =
    document.getElementById("botonCerrarSesion");

const usuarioNoLogueado =
    document.getElementById("usuarioNoLogueado");

const usuarioLogueado =
    document.getElementById("usuarioLogueado");

const fotoUsuario =
    document.getElementById("fotoUsuario");

const nombreUsuario =
    document.getElementById("nombreUsuario");


const botonEditarPerfil =
    document.getElementById("botonEditarPerfil");

const editorPerfil =
    document.getElementById("editorPerfil");

const vistaFotoPerfil =
    document.getElementById("vistaFotoPerfil");

const inputFotoPerfil =
    document.getElementById("inputFotoPerfil");

const inputNombrePerfil =
    document.getElementById("inputNombrePerfil");

const inputBiografia =
    document.getElementById("inputBiografia");

const botonGuardarPerfil =
    document.getElementById("botonGuardarPerfil");

const botonCancelarPerfil =
    document.getElementById("botonCancelarPerfil");


let usuarioActual = null;

let perfilActual = null;

let respondeA = null;


botonGoogle.addEventListener(
    "click",
    async function () {

        const { error } =
            await db.auth.signInWithOAuth({

                provider: "google",

                options: {

                    redirectTo:
                        window.location.origin

                }

            });


        if (error) {

            console.error(error);

            alert(
                "No se pudo iniciar sesión con Google."
            );

        }

    }
);


botonCerrarSesion.addEventListener(
    "click",
    async function () {

        const { error } =
            await db.auth.signOut();


        if (error) {

            console.error(error);

            alert(
                "No se pudo cerrar sesión."
            );

            return;

        }


        usuarioActual = null;

        perfilActual = null;

        actualizarInterfaz();

    }
);


function actualizarInterfaz() {

    if (usuarioActual) {

        usuarioNoLogueado.style.display =
            "none";

        usuarioLogueado.style.display =
            "flex";

        inputMensaje.disabled =
            false;

        botonPublicar.disabled =
            false;

        inputMensaje.placeholder =
            "Escribí un mensaje";


        let nombre =
            "Usuario";

        let foto =
            "";


        if (perfilActual) {

            nombre =
                perfilActual.nombre_usuario ||
                "Usuario";

            foto =
                perfilActual.foto_url ||
                "";

        }


        nombreUsuario.textContent =
            nombre;


        if (foto) {

            fotoUsuario.style.display =
                "block";

            fotoUsuario.src =
                foto +
                "?t=" +
                Date.now();

        } else {

            fotoUsuario.style.display =
                "none";

        }


    } else {

        usuarioNoLogueado.style.display =
            "block";

        usuarioLogueado.style.display =
            "none";

        editorPerfil.style.display =
            "none";

        inputMensaje.disabled =
            true;

        botonPublicar.disabled =
            true;

        inputMensaje.value =
            "";

        inputMensaje.placeholder =
            "Iniciá sesión para escribir";

    }

}


async function cargarPerfil() {

    if (!usuarioActual) {

        return;

    }


    const {
        data,
        error
    } = await db

        .from("perfiles")

        .select(
            "id, nombre_usuario, foto_url, biografia"
        )

        .eq(
            "id",
            usuarioActual.id
        )

        .maybeSingle();


    if (error) {

        console.error(
            "Error cargando perfil:",
            error
        );

        return;

    }


    if (data) {

        perfilActual =
            data;

    } else {

        const nombre =
            usuarioActual.user_metadata?.full_name ||
            usuarioActual.user_metadata?.name ||
            "Usuario";


        const foto =
            usuarioActual.user_metadata?.avatar_url ||
            usuarioActual.user_metadata?.picture ||
            null;


        const {
            data: nuevoPerfil,
            error: errorCrear
        } = await db

            .from("perfiles")

            .insert({

                id:
                    usuarioActual.id,

                nombre_usuario:
                    nombre,

                foto_url:
                    foto

            })

            .select()

            .single();


        if (errorCrear) {

            console.error(
                "Error creando perfil:",
                errorCrear
            );

            return;

        }


        perfilActual =
            nuevoPerfil;

    }


    actualizarInterfaz();

}


botonEditarPerfil.addEventListener(
    "click",
    function () {

        if (!perfilActual) {

            return;

        }


        editorPerfil.style.display =
            "block";


        inputNombrePerfil.value =
            perfilActual.nombre_usuario ||
            "";


        inputBiografia.value =
            perfilActual.biografia ||
            "";


        if (perfilActual.foto_url) {

            vistaFotoPerfil.style.display =
                "block";

            vistaFotoPerfil.src =
                perfilActual.foto_url +
                "?t=" +
                Date.now();

        } else {

            vistaFotoPerfil.style.display =
                "none";

        }

    }
);


botonCancelarPerfil.addEventListener(
    "click",
    function () {

        editorPerfil.style.display =
            "none";

        inputFotoPerfil.value =
            "";

    }
);


inputFotoPerfil.addEventListener(
    "change",
    function () {

        const archivo =
            inputFotoPerfil.files[0];


        if (!archivo) {

            return;

        }


        if (!archivo.type.startsWith("image/")) {

            alert(
                "Elegí una imagen."
            );

            inputFotoPerfil.value =
                "";

            return;

        }


        if (archivo.size > 5 * 1024 * 1024) {

            alert(
                "La imagen no puede superar los 5 MB."
            );

            inputFotoPerfil.value =
                "";

            return;

        }


        const lector =
            new FileReader();


        lector.onload =
            function (evento) {

                vistaFotoPerfil.style.display =
                    "block";

                vistaFotoPerfil.src =
                    evento.target.result;

            };


        lector.readAsDataURL(
            archivo
        );

    }
);


botonGuardarPerfil.addEventListener(
    "click",
    async function () {

        if (!usuarioActual) {

            return;

        }


        botonGuardarPerfil.disabled =
            true;


        const nombre =
            inputNombrePerfil.value.trim();


        const biografia =
            inputBiografia.value.trim();


        if (nombre === "") {

            alert(
                "Escribí un nombre."
            );

            botonGuardarPerfil.disabled =
                false;

            return;

        }


        let fotoUrl =
            perfilActual?.foto_url ||
            null;


        const archivo =
            inputFotoPerfil.files[0];


        if (archivo) {

            const extension =
                archivo.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const nombreArchivo =
                usuarioActual.id +
                "/avatar." +
                extension;


            const {
                error: errorSubida
            } = await db.storage

                .from("avatars")

                .upload(
                    nombreArchivo,
                    archivo,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            true,

                        contentType:
                            archivo.type
                    }
                );


            if (errorSubida) {

                console.error(
                    "Error subiendo foto:",
                    errorSubida
                );

                alert(
                    "No se pudo subir la foto."
                );

                botonGuardarPerfil.disabled =
                    false;

                return;

            }


            const {
                data
            } = db.storage

                .from("avatars")

                .getPublicUrl(
                    nombreArchivo
                );


            fotoUrl =
                data.publicUrl;

        }


        const {
            data,
            error
        } = await db

            .from("perfiles")

            .update({

                nombre_usuario:
                    nombre,

                foto_url:
                    fotoUrl,

                biografia:
                    biografia

            })

            .eq(
                "id",
                usuarioActual.id
            )

            .select()

            .single();


        if (error) {

            console.error(
                "Error guardando perfil:",
                error
            );

            alert(
                "No se pudo guardar el perfil."
            );

            botonGuardarPerfil.disabled =
                false;

            return;

        }


        perfilActual =
            data;


        actualizarInterfaz();


        editorPerfil.style.display =
            "none";


        inputFotoPerfil.value =
            "";


        botonGuardarPerfil.disabled =
            false;


        cargarMensajes();

    }
);


async function publicar() {

    if (!usuarioActual) {

        alert(
            "Primero iniciá sesión con Google."
        );

        return;

    }


    const texto =
        inputMensaje.value.trim();


    if (texto === "") {

        alert(
            "Escribí un mensaje."
        );

        return;

    }


    botonPublicar.disabled =
        true;


    const { error } =
        await db

            .from("mensajes")

            .insert({

                texto:
                    texto,

                responde_a:
                    respondeA,

                usuario_id:
                    usuarioActual.id

            });


    if (error) {

        console.error(
            "Error:",
            error
        );

        alert(
            "No se pudo publicar el mensaje."
        );

        botonPublicar.disabled =
            false;

        return;

    }


    inputMensaje.value =
        "";

    respondeA =
        null;

    inputMensaje.placeholder =
        "Escribí un mensaje";

    botonPublicar.disabled =
        false;


    cargarMensajes();

}


async function cargarMensajes() {

    const {
        data,
        error
    } = await db

        .from("mensajes")

        .select(
            "id, texto, creado_en, responde_a, usuario_id"
        )

        .order(
            "creado_en",
            {
                ascending:
                    false
            }
        );


    if (error) {

        console.error(
            "Error:",
            error
        );

        foro.innerHTML =
            "<p>No se pudieron cargar los mensajes.</p>";

        return;

    }


    const {
        data: perfiles,
        error: errorPerfiles
    } = await db

        .from("perfiles")

        .select(
            "id, nombre_usuario, foto_url"
        );


    if (errorPerfiles) {

        console.error(
            "Error cargando perfiles:",
            errorPerfiles
        );

    }


    foro.innerHTML =
        "";


    data.forEach(
        function (mensaje) {

            const contenedor =
                document.createElement("div");

            contenedor.className =
                "mensaje";


            const perfil =
                perfiles?.find(
                    function (p) {

                        return p.id ===
                            mensaje.usuario_id;

                    }
                );


            const lineaMensaje =
                document.createElement("div");

            lineaMensaje.className =
                "linea_mensaje";


            const autor =
                document.createElement("span");

            autor.className =
                "autor";


            if (
                perfil &&
                perfil.foto_url
            ) {

                const foto =
                    document.createElement("img");

                foto.className =
                    "foto_mensaje";

                foto.src =
                    perfil.foto_url +
                    "?t=" +
                    Date.now();

                foto.alt =
                    "Avatar";

                autor.appendChild(
                    foto
                );

            }


            const nombre =
                document.createElement("span");

            nombre.textContent =
                perfil?.nombre_usuario ||
                "Usuario";


            autor.appendChild(
                nombre
            );


            const separador =
                document.createElement("span");

            separador.textContent =
                ":";


            autor.appendChild(
                separador
            );


            lineaMensaje.appendChild(
                autor
            );


            if (mensaje.responde_a) {

                const original =
                    data.find(
                        function (m) {

                            return m.id ===
                                mensaje.responde_a;

                        }
                    );


                if (original) {

                    const cita =
                        document.createElement("div");

                    cita.textContent =
                        "↪ " +
                        original.texto.substring(
                            0,
                            70
                        );


                    if (
                        original.texto.length > 70
                    ) {

                        cita.textContent +=
                            "...";

                    }


                    cita.style.fontSize =
                        "13px";

                    cita.style.opacity =
                        "0.6";

                    cita.style.marginBottom =
                        "5px";

                    cita.style.borderLeft =
                        "3px solid rgba(0,0,0,0.4)";

                    cita.style.paddingLeft =
                        "7px";


                    contenedor.appendChild(
                        cita
                    );

                }

            }


            const texto =
                document.createElement("span");


            if (
                mensaje.texto.length > 100
            ) {

                const textoCorto =
                    document.createElement("span");


                textoCorto.textContent =
                    " " +
                    mensaje.texto.substring(
                        0,
                        100
                    ) +
                    "... ";


                const botonLeer =
                    document.createElement("button");


                botonLeer.textContent =
                    "Leer más";


                botonLeer.addEventListener(
                    "click",
                    function () {

                        texto.innerHTML =
                            "";


                        const textoCompleto =
                            document.createElement("span");


                        textoCompleto.textContent =
                            " " +
                            mensaje.texto;


                        const botonCerrar =
                            document.createElement("button");


                        botonCerrar.textContent =
                            "Leer menos";


                        botonCerrar.addEventListener(
                            "click",
                            function () {

                                texto.innerHTML =
                                    "";

                                texto.appendChild(
                                    textoCorto
                                );

                                texto.appendChild(
                                    botonLeer
                                );

                            }
                        );


                        texto.appendChild(
                            textoCompleto
                        );

                        texto.appendChild(
                            botonCerrar
                        );

                    }
                );


                texto.appendChild(
                    textoCorto
                );

                texto.appendChild(
                    botonLeer
                );


            } else {

                texto.textContent =
                    " " +
                    mensaje.texto;

            }


            lineaMensaje.appendChild(
                texto
            );


            contenedor.appendChild(
                lineaMensaje
            );


            const fecha =
                document.createElement("span");

            fecha.className =
                "fecha";

            fecha.textContent =
                new Date(
                    mensaje.creado_en
                ).toLocaleString();


            const botonResponder =
                document.createElement("button");

            botonResponder.textContent =
                "↩";

            botonResponder.title =
                "Responder a este mensaje";


            botonResponder.addEventListener(
                "click",
                function () {

                    if (
                        respondeA ===
                        mensaje.id
                    ) {

                        respondeA =
                            null;

                        inputMensaje.placeholder =
                            "Escribí un mensaje";

                        inputMensaje.focus();

                        return;

                    }


                    respondeA =
                        mensaje.id;


                    inputMensaje.placeholder =
                        "Respondiendo a: " +
                        mensaje.texto.substring(
                            0,
                            40
                        );


                    if (
                        mensaje.texto.length > 40
                    ) {

                        inputMensaje.placeholder +=
                            "...";

                    }


                    inputMensaje.focus();

                }
            );


            contenedor.appendChild(
                fecha
            );


            contenedor.appendChild(
                botonResponder
            );


            foro.appendChild(
                contenedor
            );

        }
    );

}


botonPublicar.addEventListener(
    "click",
    publicar
);


inputMensaje.addEventListener(
    "keydown",
    function (evento) {

        if (
            evento.key === "Enter"
        ) {

            publicar();

        }

    }
);


db.auth.onAuthStateChange(
    async function (
        evento,
        session
    ) {

        usuarioActual =
            session?.user || null;


        if (usuarioActual) {

            await cargarPerfil();

        } else {

            perfilActual =
                null;

            actualizarInterfaz();

        }

    }
);


async function obtenerUsuario() {

    const {
        data,
        error
    } = await db.auth.getUser();


    if (error) {

        console.error(error);

        return;

    }


    usuarioActual =
        data.user;


    if (usuarioActual) {

        await cargarPerfil();

    } else {

        actualizarInterfaz();

    }

}


obtenerUsuario();

cargarMensajes();


setInterval(
    cargarMensajes,
    3000
);
