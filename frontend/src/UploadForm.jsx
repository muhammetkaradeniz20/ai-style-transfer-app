import React, { useState } from "react";

function UploadForm() {
  const [preview, setPreview] = useState(null);
  const [style, setStyle] = useState("grayscale");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);
      setResult(null);
      setError("");
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!preview) {
      setError("Lütfen önce bir resim seçin.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview, style }),
      });

      const data = await response.json();

      if (data.result) {
        setResult(`data:image/png;base64,${data.result}`);
        setError("");
      } else {
        setError("Dönüştürme başarısız oldu.");
      }
    } catch (err) {
      setError("Sunucuya ulaşılamıyor.");
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = "donusturulmus_resim.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "50px auto",
        padding: 35,
        background: "linear-gradient(135deg, #4b6cb7, #182848)",
        borderRadius: 15,
        boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#e0e0e0",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontWeight: "900",
          marginBottom: 40,
          fontSize: "3rem",
          letterSpacing: 2,
          textShadow: "2px 2px 8px rgba(0,0,0,0.6)",
        }}
      >
        AI Görsel Dönüştürücü
      </h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 12,
          border: "2px solid #6a85b6",
          marginBottom: 30,
          cursor: "pointer",
          backgroundColor: "#f0f0f0",
        }}
      />

      <select
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 12,
          border: "none",
          marginBottom: 40,
          fontSize: 18,
          fontWeight: "700",
          color: "#333",
          boxShadow: "0 0 10px #182848 inset",
          cursor: "pointer",
        }}
      >
        <option value="grayscale">Siyah Beyaz</option>
        <option value="enhance">Renk Canlandır</option>
        <option value="blur">Bulanıklaştır</option>
        <option value="mirror">Yansıt (Mirror)</option>
        <option value="sepia">Sepia (Eski Fotoğraf)</option>
        <option value="cartoon">Cartoon (Çizgi Film)</option>
        <option value="negative">Negatif</option>
        <option value="brightness">Parlaklık Artır</option>
      </select>

      <button
        onClick={handleSubmit}
        style={{
          padding: "15px 50px",
          backgroundColor: "#f06292",
          border: "none",
          borderRadius: 14,
          color: "#fff",
          fontWeight: "900",
          fontSize: 22,
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          marginBottom: 30,
          boxShadow: "0 8px 20px #f06292",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ec407a")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f06292")}
      >
        Dönüştür
      </button>

      {result && (
        <>
          <div
            style={{
              display: "flex",
              gap: 40,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 30,
            }}
          >
            <div style={{ flex: "1 1 300px" }}>
              <h3>Orijinal Görsel</h3>
              <img
                src={preview}
                alt="Orijinal"
                style={{
                  width: "100%",
                  borderRadius: 15,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  objectFit: "contain",
                }}
              />
            </div>

            <div style={{ flex: "1 1 300px" }}>
              <h3>Dönüştürülmüş Görsel</h3>
              <img
                src={result}
                alt="Dönüştürülmüş"
                style={{
                  width: "100%",
                  borderRadius: 15,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          <button
            onClick={handleDownload}
            style={{
              padding: "12px 35px",
              backgroundColor: "#4caf50",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontWeight: "700",
              fontSize: 18,
              cursor: "pointer",
              boxShadow: "0 6px 15px #4caf50",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#388e3c")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4caf50")}
          >
            Dönüştürülmüş Resmi İndir
          </button>
        </>
      )}

      {error && (
        <p
          style={{
            color: "#ff5252",
            fontWeight: "700",
            marginTop: 20,
            fontSize: 16,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default UploadForm;
