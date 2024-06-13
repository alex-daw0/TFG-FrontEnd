import axios from "axios";
import router from "../router";

export default function axiosSetUp() {
  axios.defaults.baseURL = "https://localhost:7030/";
  axios.interceptors.request.use(
    function (config) {

      const token = localStorage.getItem("token");

      if (token) {
        const tokenParse = JSON.parse(token);
        config.headers.Authorization = `Bearer ${tokenParse.token}`;
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    function (response) {
     
      return response;
    },
    async function (error) {
     
      const originalRequest = error.config;

      const tokenNoParse = localStorage.getItem("token");
      if (tokenNoParse) {
        const token = JSON.parse(tokenNoParse);
        const fecha = new Date(token.fechaExpiracion);

        /*Nuestras peticiones con token caducado serán rechazadas mediante un 401, por lo que en caso de recibir un 401, trataremos de renovar o no el token dependiendo de hace
          cuanto tiempo haya caducado, en nuestro caso se ha puesto un límite de 5 minutos para la renovación*/
        if (error.response?.status === 401 && (Date.now() - fecha.getTime() >= 300000)) {
          localStorage.clear();
          router.push("/login");
          return Promise.reject(error);
        } else if (error.response?.status === 401 && (Date.now() - fecha.getTime() < 300000)) {
          await renovarToken();
          originalRequest._retry = true;
          return axios(originalRequest);
        }
        return Promise.reject(error);
      }
    }
  );
   const  renovarToken = async () => {
    const tokenSinParse = localStorage.getItem("token");
    if (tokenSinParse) {
      const token = JSON.parse(tokenSinParse);
      const decode = decodeJwt(token.token);

      const params = {
        params: {
          nombre: token.nombre,
          email: token.email,
          userId: token.userId,
          idEmpresa: token.idEmpresa,
          guidEmpresa: token.guiD_Empresa,
          guidUsuario: token.guiD_Usuario,
          esAdministrador: decode.ESADMINISTRADOR ? true : false
        },
      };
      await axios
        .get("https://localhost:7030/Login/RestoreToken", params)
        .then((response) => {
          localStorage.setItem("token", JSON.stringify(response.data));

        })
        .catch((error) => {
          localStorage.clear();
          router.push('/login')
        });
    }
  };

  const decodeJwt = (token: string) =>  {
    var base64Payload = token.split(".")[1];
    var payload = decodeURIComponent(
      atob(base64Payload)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(payload);
  };
}
