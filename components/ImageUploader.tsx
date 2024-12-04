import React, { useState, ChangeEvent, useEffect } from 'react';

interface ImageUploaderProps {
  onUploadComplete?: (data: any) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadComplete }) => {
  const handleCancelImage = () => {
    setSelectedImage(null); // Reseta a imagem selecionada
    setImagePreview(null);  // Remove a pré-visualização
  };
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [zoomPC, setZoomPC] = useState<number>(1);
  const [zoomMobile, setZoomMobile] = useState<number>(1);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  // States for position and dragging for each view
  const [positionPC, setPositionPC] = useState({ x: 0, y: 0 });
  const [positionMobile, setPositionMobile] = useState({ x: 0, y: 0 });
  const [isDraggingPC, setIsDraggingPC] = useState(false);
  const [isDraggingMobile, setIsDraggingMobile] = useState(false);

  const [startPositionPC, setStartPositionPC] = useState({ x: 0, y: 0 });
  const [startPositionMobile, setStartPositionMobile] = useState({ x: 0, y: 0 });
  const [offsetPC, setOffsetPC] = useState({ x: 0, y: 0 });
  const [offsetMobile, setOffsetMobile] = useState({ x: 0, y: 0 });

  // New states for title and description
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('PLANOS'); // Default category

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoomChangePC = (event: ChangeEvent<HTMLInputElement>) => {
    setZoomPC(Number(event.target.value));
  };

  const handleZoomChangeMobile = (event: ChangeEvent<HTMLInputElement>) => {
    setZoomMobile(Number(event.target.value));
  };

  const handleUpload = async () => {
    if (!title || !description || !selectedImage) {
      setModalMessage('❌ Preencha o título, descrição e selecione uma imagem.');
      return;
    }

    try {
      // First, upload the image
      const formData = new FormData();
      formData.append('image', selectedImage);

      const imageResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!imageResponse.ok) {
        throw new Error('Erro ao enviar a imagem');
      }

      const imageData = await imageResponse.json();
      const imagePath = imageData.imageUrl;

      // Now, create the post with all data
      const postResponse = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          image_path: imagePath,
          category,
          zoom_pc: zoomPC,
          zoom_mobile: zoomMobile,
          position_pc: positionPC,
          position_mobile: positionMobile,
        }),
      });

      if (!postResponse.ok) {
        throw new Error('Erro ao criar o post');
      }

      setModalMessage('✅ Post criado com sucesso!');

      // Reset fields after successful upload
      setSelectedImage(null);
      setImagePreview(null);
      setZoomPC(1);
      setZoomMobile(1);
      setPositionPC({ x: 0, y: 0 });
      setPositionMobile({ x: 0, y: 0 });
      setTitle('');
      setDescription('');
      setCategory('PLANOS');

      // Call onUploadComplete if provided
      if (onUploadComplete) {
        onUploadComplete(null);
      }
    } catch (error) {
      console.error(error);
      setModalMessage('❌ Ocorreu um erro ao criar o post.');
    }
  };

  const closeModal = () => {
    setModalMessage(null);
  };

  useEffect(() => {
    // Manipulação de eventos para a visualização PC
    if (isDraggingPC) {
      const handleMouseMovePC = (event: MouseEvent | TouchEvent) => {
        let x, y;
        if (event instanceof TouchEvent) {
          event.preventDefault();
          x = event.touches[0].clientX;
          y = event.touches[0].clientY;
        } else {
          x = (event as MouseEvent).clientX;
          y = (event as MouseEvent).clientY;
        }
        const deltaX = x - startPositionPC.x;
        const deltaY = y - startPositionPC.y;
        setPositionPC({ x: offsetPC.x + deltaX, y: offsetPC.y + deltaY });
      };

      const handleMouseUpPC = () => {
        setIsDraggingPC(false);
      };

      document.addEventListener('mousemove', handleMouseMovePC);
      document.addEventListener('mouseup', handleMouseUpPC);
      document.addEventListener('touchmove', handleMouseMovePC);
      document.addEventListener('touchend', handleMouseUpPC);

      return () => {
        document.removeEventListener('mousemove', handleMouseMovePC);
        document.removeEventListener('mouseup', handleMouseUpPC);
        document.removeEventListener('touchmove', handleMouseMovePC);
        document.removeEventListener('touchend', handleMouseUpPC);
      };
    }
  }, [isDraggingPC, startPositionPC, offsetPC]);

  useEffect(() => {
    // Manipulação de eventos para a visualização Mobile
    if (isDraggingMobile) {
      const handleMouseMoveMobile = (event: MouseEvent | TouchEvent) => {
        let x, y;
        if (event instanceof TouchEvent) {
          event.preventDefault();
          x = event.touches[0].clientX;
          y = event.touches[0].clientY;
        } else {
          x = (event as MouseEvent).clientX;
          y = (event as MouseEvent).clientY;
        }
        const deltaX = x - startPositionMobile.x;
        const deltaY = y - startPositionMobile.y;
        setPositionMobile({ x: offsetMobile.x + deltaX, y: offsetMobile.y + deltaY });
      };

      const handleMouseUpMobile = () => {
        setIsDraggingMobile(false);
      };

      document.addEventListener('mousemove', handleMouseMoveMobile);
      document.addEventListener('mouseup', handleMouseUpMobile);
      document.addEventListener('touchmove', handleMouseMoveMobile);
      document.addEventListener('touchend', handleMouseUpMobile);

      return () => {
        document.removeEventListener('mousemove', handleMouseMoveMobile);
        document.removeEventListener('mouseup', handleMouseUpMobile);
        document.removeEventListener('touchmove', handleMouseMoveMobile);
        document.removeEventListener('touchend', handleMouseUpMobile);
      };
    }
  }, [isDraggingMobile, startPositionMobile, offsetMobile]);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '30px' }}>
      <h2>Criar Post</h2>

      {/* Title Field */}
      <div>
        <label>Título *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '80%', padding: '8px', marginBottom: '10px' }}
        />
      </div>

      {/* Description Field */}
      <div>
        <label>Descrição *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: '80%', padding: '8px', marginBottom: '10px' }}
        />
      </div>

      {/* Category Field */}
      <div>
        <label>Categoria *</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: '80%', padding: '8px', marginBottom: '10px' }}
        >
          <option value="PLANOS">Planos</option>
          <option value="AVISOS">Avisos</option>
          <option value="AULAS">Aulas</option>
        </select>
      </div>

     {/* Image Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ marginBottom: '20px' }}
      />

      {selectedImage && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          {/* Image Pre-View */}
          {imagePreview && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '280px',
                    height: `${(280 / 9) * 16}px`,
                    border: '6px solid #42ff00',
                    borderRadius: '15px',
                    backgroundImage: `url(${imagePreview})`,
                    backgroundSize: `${zoomPC * 100}%`,
                    backgroundPosition: `${positionPC.x}px ${positionPC.y}px`,
                    backgroundRepeat: 'no-repeat',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    cursor: isDraggingPC ? 'grabbing' : 'grab',
                    backgroundColor: 'rgb(255 255 255 / 35%)',
                    touchAction: 'none', // Prevent scrolling when dragging
                  }}
                  onMouseDown={(e) => {
                    setIsDraggingPC(true);
                    setStartPositionPC({ x: e.clientX, y: e.clientY });
                    setOffsetPC(positionPC);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setIsDraggingPC(true);
                    setStartPositionPC({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                    setOffsetPC(positionPC);
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '10px',
                      fontSize: '14px',
                    }}
                  >
                    Use imagens no formato de um story (como no Instagram)
                  </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>Proporção da imagem: 16:9</label>
                  <label>Zoom: </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoomPC}
                    onChange={handleZoomChangePC}
                    style={{ width: '200px', color: 'black' }}
                  />
                </div>
                {/* Cancel Button */}
                <button
                  onClick={handleCancelImage}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleUpload}
        className="upload-button"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#2ecc71',
          color: '#fff',
          borderRadius: '5px',
          border: 'none',
          marginTop: '20px',
        }}
      >
        Criar Post
      </button>

      {/* Confirmation Modal */}
      {modalMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              width: '80%',
              maxWidth: '400px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <p style={{ color: modalMessage.includes('❌') ? 'red' : 'green' }}>{modalMessage}</p>
            <button
              onClick={closeModal}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#2ecc71',
                color: 'white',
                borderRadius: '5px',
                border: 'none',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
