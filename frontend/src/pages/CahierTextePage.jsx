import { useNavigate } from "react-router-dom";

export default function CahierTextePage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate(-1)}>← Retour</button>
      <h2>Cahier de texte</h2>
      <p>Page en construction...</p>
    </div>
  );
}