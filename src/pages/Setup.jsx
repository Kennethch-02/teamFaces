import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useStorage } from "../hooks/useStorage";
import { db } from "../config/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import Logo from "../assets/Logo";
const Setup = () => {
  const navigate = useNavigate();
  const { signup, user } = useAuth();
  const {
    uploadTeamLogo,
    loading: uploadLoading,
    error: uploadError,
  } = useStorage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirigir si ya hay un usuario autenticado
  useEffect(() => {
    const checkTeam = async () => {
      try {
        const teamRef = doc(db, "teams", "default");
        const teamSnap = await getDoc(teamRef);

        if (teamSnap.exists()) {
          navigate("/");
          return;
        }
      } catch (er) {
        console.error("Error loading team data:", er);
        setError("No se pudo cargar la información del equipo");
      }
    };

    checkTeam();

    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Datos del equipo
  const [teamData, setTeamData] = useState({
    name: "",
    description: "",
    logo: null,
    logoPreview: null,
  });

  // Datos del administrador
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Solo se permiten archivos de imagen");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("El archivo no debe superar los 5MB");
        return;
      }

      setTeamData({
        ...teamData,
        logo: file,
        logoPreview: URL.createObjectURL(file),
      });
      setError("");
    }
  };

  const validateTeamData = () => {
    if (!teamData.name.trim()) {
      setError("El nombre del equipo es requerido");
      return false;
    }
    if (teamData.name.length < 3) {
      setError("El nombre del equipo debe tener al menos 3 caracteres");
      return false;
    }
    return true;
  };

  const validateAdminData = () => {
    if (
      !adminData.name.trim() ||
      !adminData.email.trim() ||
      !adminData.password ||
      !adminData.confirmPassword
    ) {
      setError("Todos los campos son requeridos");
      return false;
    }
    if (adminData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (adminData.password !== adminData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    if (validateTeamData()) {
      setError("");
      setStep(2);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdminData()) return;

    setError("");
    setLoading(true);

    try {
      const userCredential = await signup(
        adminData.email,
        adminData.password,
        adminData
      );

      let logoUrl = null;
      if (teamData.logo) {
        try {
          logoUrl = await uploadTeamLogo(teamData.logo);
        } catch (uploadError) {
          console.error("Error al subir logo:", uploadError);
        }
      }

      const teamRef = doc(db, "teams", "default");
      await setDoc(teamRef, {
        name: teamData.name,
        description: teamData.description || "",
        logoUrl,
        adminId: userCredential.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          allowSelfRegister: false,
          requireApproval: true,
          theme: "dark",
        },
      });

      const memberRef = doc(db, "teams/default/members", userCredential.uid);
      await setDoc(memberRef, {
        name: adminData.name,
        email: adminData.email,
        role: "admin",
        status: "available",
        statusMessage: "¡Equipo configurado!",
        photoUrl: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          notifications: true,
          theme: "dark",
        },
      });

      navigate("/admin");
    } catch (err) {
      console.error("Error en setup:", err);
      setError(err.message || "Error al configurar el equipo");
      setLoading(false);
    }
  };

  const renderError = () => {
    const errorMessage = error || uploadError;
    if (!errorMessage) return null;

    return (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {errorMessage}
      </div>
    );
  };

  return (
    <section className="bg-white dark:bg-gray-900 h-screen">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1617195737496-bc30194e3a19?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />

          <div className="hidden lg:relative lg:block lg:p-12">
            <div className="block text-white">
              <span className="sr-only">Inicio</span>
              <Logo />
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-white">
              Bienvenido a tu nuevo equipo con TeamFaces 🦑
            </h1>

            <p className="mt-4 leading-relaxed text-gray-500 dark:text-gray-400">
              Una forma de ver a tu equipo de una manera diferente
            </p>
          </div>
        </section>

        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl">
            <div className="relative -mt-16 block lg:hidden">
              <div className="inline-flex size-16 items-center justify-center rounded-full bg-white text-blue-600 sm:size-20 dark:bg-gray-900">
                <span className="sr-only">Inicio</span>
                <Logo />
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-white">
                Bienvenido a tu nuevo equipo con TeamFaces 🦑
              </h1>

              <p className="mt-4 leading-relaxed text-gray-500 dark:text-gray-400">
                Una forma de ver a tu equipo de una manera diferente
              </p>
            </div>

            {renderError()}
            <div className="col-span-6">
              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-white">
                {step === 1 ? "Configura tu Equipo" : "Cuenta de Administrador"}
              </h1>

              <p className="mt-4 leading-relaxed text-gray-500 dark:text-gray-400">
                {step === 1
                  ? "Información básica del equipo"
                  : "Datos del administrador principal"}
              </p>
            </div>
            {step === 1 ? (
              <form
                onSubmit={handleTeamSubmit}
                className="mt-8 grid grid-cols-6 gap-6"
              >
                <div className="col-span-6">
                  <label
                    htmlFor="TeamName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Nombre del Equipo
                  </label>

                  <input
                    type="text"
                    id="TeamName"
                    value={teamData.name}
                    onChange={(e) =>
                      setTeamData({ ...teamData, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    required
                    minLength={3}
                  />
                </div>

                <div className="col-span-6">
                  <label
                    htmlFor="Description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Descripción
                  </label>

                  <textarea
                    id="Description"
                    value={teamData.description}
                    onChange={(e) =>
                      setTeamData({ ...teamData, description: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    rows="3"
                  />
                </div>

                <div className="col-span-6">
                  <label
                    htmlFor="Logo"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Logo del Equipo
                  </label>

                  <div className="mt-1 flex items-center space-x-4">
                    {teamData.logoPreview && (
                      <img
                        src={teamData.logoPreview}
                        alt="Preview"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    )}
                    <input
                      type="file"
                      id="Logo"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Formato: JPG, PNG. Tamaño máximo: 5MB
                  </p>
                </div>

                <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                  <button
                    type="submit"
                    className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500 dark:hover:bg-blue-700 dark:hover:text-white"
                  >
                    Continuar
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleAdminSubmit}
                className="mt-8 grid grid-cols-6 gap-6"
              >
                <div className="col-span-6">
                  <label
                    htmlFor="AdminName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Nombre Completo
                  </label>

                  <input
                    type="text"
                    id="AdminName"
                    value={adminData.name}
                    onChange={(e) =>
                      setAdminData({ ...adminData, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    required
                  />
                </div>

                <div className="col-span-6">
                  <label
                    htmlFor="Email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Email
                  </label>

                  <input
                    type="email"
                    id="Email"
                    value={adminData.email}
                    onChange={(e) =>
                      setAdminData({ ...adminData, email: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="Password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Contraseña
                  </label>

                  <input
                    type="password"
                    id="Password"
                    value={adminData.password}
                    onChange={(e) =>
                      setAdminData({ ...adminData, password: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    required
                    minLength={6}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="PasswordConfirmation"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Confirmar Contraseña
                  </label>

                  <input
                    type="password"
                    id="PasswordConfirmation"
                    value={adminData.confirmPassword}
                    onChange={(e) =>
                      setAdminData({
                        ...adminData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                  <button
                    type="submit"
                    className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500 dark:hover:bg-blue-700 dark:hover:text-white"
                  >
                    Crear cuenta
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </section>
  );
};
export default Setup;
