import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import jsQR from "jsqr";

const API = 'http://localhost/eduschedulepro/backend/api';
export default function QRScannerPage() {
  const { token, utilisateur } = useAuth();
  const navigate = useNavigate();
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const intervalRef = useRef(null);

  const [mode, setMode]           = useState("camera"); // camera | manuel
  const [tokenManuel, setTokenManuel] = useState("");
  const [scanning, setScanning]   = useState(false);
  const [resultat, setResultat]   = useState(null); // null | success | error | retard
  const [creneauPreview, setCreneauPreview] = useState(null); // infos avant confirmation
  const [tokenEnAttente, setTokenEnAttente] = useState(null); // token en attente de confirmation
  const [creneau, setCreneau]     = useState(null);
  const [message, setMessage]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [dark, setDark]           = useState(false);

  const bg   = dark ? "#0d1117" : "#f0faf6";
  const bg2  = dark ? "#161b22" : "#ffffff";
  const bg3  = dark ? "#21262d" : "#e1f5ee";
  const txt  = dark ? "#e6edf3" : "#04342C";
  const txt2 = dark ? "#8b949e" : "#5F5E5A";
  const brd  = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        startScan();
      }
    } catch (err) {
      setMessage("❌ Impossible d'accéder à la caméra. Utilisez la saisie manuelle.");
      setMode("manuel");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setScanning(false);
  };

  const startScan = () => {
    intervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx    = canvas.getContext("2d");
      canvas.width  = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        stopCamera();
        validerToken(code.data);
      }
    }, 300);
  };

 const verifierToken = async (token_qr) => {
    setLoading(true);
    setResultat(null);
    try {
      const res = await axios.post(`${API}/pointages.php?action=verifier`, {
        token_qr
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.succes) {
        setCreneauPreview(res.data.creneau);
        setTokenEnAttente(token_qr);
        setMessage("");
      }
    } catch (err) {
      setResultat("error");
      setMessage(err.response?.data?.message || "Token invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const confirmerPointage = async () => {
    if (!tokenEnAttente) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/pointages.php?action=scan`, {
        token_qr: tokenEnAttente
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.succes) {
        setCreneau(res.data.creneau);
        setResultat(res.data.statut === "retard" ? "retard" : "success");
        setMessage(res.data.message);
        setCreneauPreview(null);
        setTokenEnAttente(null);
      }
    } catch (err) {
      setResultat("error");
      setMessage(err.response?.data?.message || "Erreur lors du pointage.");
    } finally {
      setLoading(false);
    }
  };

  const validerToken = async (token_qr) => {
    verifierToken(token_qr);
  };

  const handleSaisieManuelle = () => {
    if (!tokenManuel.trim()) {
      setMessage("⚠️ Entrez un token QR !");
      return;
    }
    validerToken(tokenManuel.trim());
  };

  const reset = () => {
    setResultat(null);
    setCreneau(null);
    setMessage("");
    setTokenManuel("");
    setMode("camera");
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, transition: "all 0.3s" }}>

      {/* Topbar */}
      <div style={{
        background: "#04342C", padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => { stopCamera(); navigate(-1); }} style={{
            background: "rgba(255,255,255,0.1)", border: "none", color: "#E1F5EE",
            borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "13px"
          }}>← Retour</button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", background: "#1D9E75", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#E1F5EE" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ color: "#E1F5EE", fontWeight: "500", fontSize: "14px" }}>EduTrack Pro</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ color: "#9FE1CB", fontSize: "12px" }}>{utilisateur?.email}</span>
          <button onClick={() => setDark(!dark)} style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "14px" }}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem 1rem" }}>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontSize: "20px", fontWeight: "600", color: txt, margin: "0 0 6px" }}>
            📱 Pointage QR-Code
          </p>
          <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>
            Scannez le QR-Code affiché dans la salle pour pointer votre présence
          </p>
        </div>

        {/* Résultat */}
        {resultat && (
          <div style={{
            background: resultat === "success" ? "#E1F5EE" : resultat === "retard" ? "#FAEEDA" : "#FCEBEB",
            borderRadius: "16px", padding: "2rem", textAlign: "center", marginBottom: "1.5rem",
            border: `2px solid ${resultat === "success" ? "#0F6E56" : resultat === "retard" ? "#BA7517" : "#E24B4A"}`
          }}>
            <p style={{ fontSize: "48px", margin: "0 0 12px" }}>
              {resultat === "success" ? "✅" : resultat === "retard" ? "⚠️" : "❌"}
            </p>
            <p style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 8px",
              color: resultat === "success" ? "#085041" : resultat === "retard" ? "#633806" : "#791F1F"
            }}>
              {resultat === "success" ? "Pointage validé !" : resultat === "retard" ? "Retard signalé" : "Pointage refusé"}
            </p>
            <p style={{ fontSize: "13px", margin: "0 0 16px",
              color: resultat === "success" ? "#1D9E75" : resultat === "retard" ? "#BA7517" : "#E24B4A"
            }}>
              {message}
            </p>

            {/* Détails créneau */}
            {creneau && (
              <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "10px", padding: "12px", marginBottom: "16px", textAlign: "left" }}>
                {[
                  { label: "Matière",  val: creneau.matiere },
                  { label: "Classe",   val: creneau.classe },
                  { label: "Début",    val: creneau.heure_debut?.slice(0,5) },
                  { label: "Fin",      val: creneau.heure_fin?.slice(0,5) },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                    <span style={{ fontSize: "12px", color: "#5F5E5A" }}>{item.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#04342C" }}>{item.val}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={reset} style={{
              padding: "10px 24px", background: "#0F6E56", color: "#fff",
              border: "none", borderRadius: "8px", fontSize: "13px",
              fontWeight: "500", cursor: "pointer"
            }}>
              Nouveau scan
            </button>
          </div>
        )}

        {/* Interface scan */}
        {!resultat && (
            
          <div>

     {/* Prévisualisation séance avant confirmation */}
      {creneauPreview && (
      <div style={{
         background: "#E1F5EE", borderRadius: "16px", padding: "1.5rem",
         marginBottom: "1.5rem", border: "2px solid #0F6E56"
     }}>
    <p style={{ fontSize: "16px", fontWeight: "600", color: "#085041", margin: "0 0 16px", textAlign: "center" }}>
      📋 Confirmer le pointage
    </p>
    <div style={{ background: "#fff", borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
      {[
        { label: "Matière",    val: creneauPreview.matiere },
        { label: "Classe",     val: creneauPreview.classe },
        { label: "Salle",      val: creneauPreview.salle },
        { label: "Enseignant", val: creneauPreview.enseignant },
        { label: "Début",      val: creneauPreview.heure_debut?.slice(0,5) },
        { label: "Fin",        val: creneauPreview.heure_fin?.slice(0,5) },
      ].map(item => (
        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
          <span style={{ fontSize: "13px", color: "#5F5E5A" }}>{item.label}</span>
          <span style={{ fontSize: "13px", fontWeight: "500", color: "#04342C" }}>{item.val}</span>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", gap: "10px" }}>
      <button onClick={confirmerPointage} disabled={loading} style={{
        flex: 1, padding: "12px", background: "#0F6E56", color: "#fff",
        border: "none", borderRadius: "10px", fontSize: "14px",
        fontWeight: "500", cursor: "pointer"
      }}>
        {loading ? "⏳..." : "✅ Confirmer le pointage"}
      </button>
      <button onClick={() => { setCreneauPreview(null); setTokenEnAttente(null); reset(); }} style={{
        padding: "12px 16px", background: "#FCEBEB", color: "#791F1F",
        border: "0.5px solid #F09595", borderRadius: "10px",
        fontSize: "14px", cursor: "pointer"
      }}>❌ Annuler</button>
    </div>
  </div>
)}
            {/* Sélecteur mode */}
            <div style={{ display: "flex", background: bg3, borderRadius: "10px", padding: "4px", marginBottom: "1.5rem" }}>
              {[
                { val: "camera", label: "📷 Scanner QR" },
                { val: "manuel", label: "⌨️ Saisie manuelle" },
              ].map(m => (
                <button key={m.val} onClick={() => { setMode(m.val); if (m.val !== "camera") stopCamera(); }} style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer",
                  background: mode === m.val ? "#0F6E56" : "transparent",
                  color: mode === m.val ? "#fff" : txt2,
                  fontSize: "13px", fontWeight: mode === m.val ? "500" : "400"
                }}>{m.label}</button>
              ))}
            </div>

            {/* Mode caméra */}
            {mode === "camera" && (
              <div>
                <div style={{
                  background: "#000", borderRadius: "16px", overflow: "hidden",
                  position: "relative", aspectRatio: "1", marginBottom: "16px"
                }}>
                  <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline/>
                  <canvas ref={canvasRef} style={{ display: "none" }}/>

                  {/* Overlay viseur */}
                  {scanning && (
                    <div style={{
                      position: "absolute", inset: 0, display: "flex",
                      alignItems: "center", justifyContent: "center"
                    }}>
                      <div style={{
                        width: "200px", height: "200px", position: "relative"
                      }}>
                        {/* Coins du viseur */}
                        {[
                          { top: 0, left: 0, borderTop: "3px solid #1D9E75", borderLeft: "3px solid #1D9E75" },
                          { top: 0, right: 0, borderTop: "3px solid #1D9E75", borderRight: "3px solid #1D9E75" },
                          { bottom: 0, left: 0, borderBottom: "3px solid #1D9E75", borderLeft: "3px solid #1D9E75" },
                          { bottom: 0, right: 0, borderBottom: "3px solid #1D9E75", borderRight: "3px solid #1D9E75" },
                        ].map((s, i) => (
                          <div key={i} style={{ position: "absolute", width: "30px", height: "30px", ...s }}/>
                        ))}
                      </div>
                    </div>
                  )}

                  {!scanning && (
                    <div style={{
                      position: "absolute", inset: 0, display: "flex",
                      flexDirection: "column", alignItems: "center", justifyContent: "center",
                      background: "rgba(0,0,0,0.7)"
                    }}>
                      <p style={{ fontSize: "48px", margin: "0 0 12px" }}>📷</p>
                      <p style={{ color: "#fff", fontSize: "13px", margin: "0 0 16px" }}>
                        Cliquez pour activer la caméra
                      </p>
                      <button onClick={startCamera} style={{
                        padding: "10px 24px", background: "#0F6E56", color: "#fff",
                        border: "none", borderRadius: "8px", fontSize: "13px",
                        fontWeight: "500", cursor: "pointer"
                      }}>
                        Activer la caméra
                      </button>
                    </div>
                  )}
                </div>

                {scanning && (
                  <div style={{ textAlign: "center", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1D9E75", animation: "pulse 1s infinite" }}/>
                      <p style={{ color: txt2, fontSize: "13px", margin: 0 }}>Scan en cours...</p>
                    </div>
                    <button onClick={stopCamera} style={{
                      marginTop: "10px", padding: "8px 16px", background: "#FCEBEB", color: "#791F1F",
                      border: "0.5px solid #F09595", borderRadius: "8px", fontSize: "12px", cursor: "pointer"
                    }}>Arrêter</button>
                  </div>
                )}
              </div>
            )}

            {/* Mode manuel */}
            {mode === "manuel" && (
              <div style={{ background: bg2, borderRadius: "16px", border: `0.5px solid ${brd}`, padding: "1.5rem" }}>
                <p style={{ fontSize: "14px", fontWeight: "500", color: txt, margin: "0 0 8px" }}>
                  ⌨️ Saisie manuelle du token
                </p>
                <p style={{ fontSize: "12px", color: txt2, margin: "0 0 16px" }}>
                  En cas de problème avec le scan, entrez le code manuellement.
                </p>
                <input
                  type="text"
                  value={tokenManuel}
                  onChange={e => setTokenManuel(e.target.value)}
                  placeholder="Entrez le token QR..."
                  onKeyDown={e => e.key === "Enter" && handleSaisieManuelle()}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "12px 14px", borderRadius: "10px",
                    border: `0.5px solid ${brd}`, background: bg3,
                    color: txt, fontSize: "14px", marginBottom: "12px",
                    fontFamily: "monospace"
                  }}
                />
                <button onClick={handleSaisieManuelle} disabled={loading} style={{
                  width: "100%", padding: "12px", background: "#0F6E56", color: "#fff",
                  border: "none", borderRadius: "10px", fontSize: "14px",
                  fontWeight: "500", cursor: loading ? "not-allowed" : "pointer"
                }}>
                  {loading ? "⏳ Vérification..." : "✅ Valider le pointage"}
                </button>
              </div>
            )}

            {/* Message erreur */}
            {message && !resultat && (
              <div style={{
                background: "#FAEEDA", borderRadius: "10px", padding: "12px 16px",
                marginTop: "16px", display: "flex", gap: "8px", alignItems: "center"
              }}>
                <span>⚠️</span>
                <p style={{ fontSize: "13px", color: "#633806", margin: 0 }}>{message}</p>
              </div>
            )}
          </div>
        )}

        {/* Info sécurité */}
        <div style={{ background: bg2, borderRadius: "12px", border: `0.5px solid ${brd}`, padding: "16px", marginTop: "1.5rem" }}>
          <p style={{ fontSize: "13px", fontWeight: "500", color: txt, margin: "0 0 10px" }}>
            🔒 Sécurité du pointage
          </p>
          {[
            "Chaque QR-Code est à usage unique",
            "Valide ±15 minutes autour de l'heure prévue",
            "Votre IP et horodatage sont enregistrés",
            "Un retard de +30 min déclenche une alerte",
          ].map((info, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
              <span style={{ color: "#0F6E56", fontSize: "12px" }}>✓</span>
              <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>{info}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}