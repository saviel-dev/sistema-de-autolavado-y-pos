import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTestBarcodes, formatBarcode } from '@/lib/barcodeUtils';
import JsBarcode from 'jsbarcode';
import { IoDownloadOutline, IoPrintOutline, IoBarcodeOutline } from 'react-icons/io5';

const BarcodeTestPanel = () => {
  const [testBarcodes] = useState(generateTestBarcodes());
  const [generatedImages, setGeneratedImages] = useState<{ [key: string]: string }>({});

  const generateBarcodeImage = (code: string) => {
    if (generatedImages[code]) {
      return generatedImages[code];
    }

    const canvas = document.createElement('canvas');
    try {
      JsBarcode(canvas, code, {
        format: code.length === 13 ? 'EAN13' : 'UPC',
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 14,
        margin: 10,
      });
      const imageUrl = canvas.toDataURL('image/png');
      setGeneratedImages(prev => ({ ...prev, [code]: imageUrl }));
      return imageUrl;
    } catch (error) {
      console.error('Error generating barcode:', error);
      return '';
    }
  };

  const downloadBarcode = (code: string, name: string) => {
    const imageUrl = generateBarcodeImage(code);
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `barcode-${code}-${name.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const downloadAllBarcodes = () => {
    testBarcodes.forEach(({ code, name }) => {
      setTimeout(() => downloadBarcode(code, name), 100);
    });
  };

  const printBarcode = (code: string) => {
    const imageUrl = generateBarcodeImage(code);
    if (!imageUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Código de Barras - ${code}</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .barcode-container {
              text-align: center;
              padding: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <img src="${imageUrl}" alt="Barcode ${code}" />
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Panel de Pruebas - Códigos de Barras</h1>
          <p className="text-muted-foreground mt-2">
            Genera y descarga códigos de barras para pruebas del sistema de inventario
          </p>
        </div>
        <Button onClick={downloadAllBarcodes} className="gap-2">
          <IoDownloadOutline className="h-5 w-5" />
          Descargar Todos
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testBarcodes.map(({ code, name, type }) => {
          const imageUrl = generateBarcodeImage(code);
          
          return (
            <Card key={code}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IoBarcodeOutline className="h-5 w-5" />
                  {name}
                </CardTitle>
                <CardDescription>
                  {type} - {formatBarcode(code)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  {imageUrl && (
                    <img 
                      src={imageUrl} 
                      alt={`Barcode ${code}`}
                      className="w-full h-auto"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => downloadBarcode(code, name)}
                  >
                    <IoDownloadOutline className="h-4 w-4" />
                    Descargar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => printBarcode(code)}
                  >
                    <IoPrintOutline className="h-4 w-4" />
                    Imprimir
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground font-mono text-center">
                  {code}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>1. Descargar códigos:</strong> Haz clic en "Descargar" para guardar el código de barras como imagen PNG.
          </p>
          <p>
            <strong>2. Imprimir códigos:</strong> Usa el botón "Imprimir" para imprimir el código directamente.
          </p>
          <p>
            <strong>3. Probar escaneo:</strong> Muestra el código impreso o en pantalla (monitor secundario/celular) a la cámara web.
          </p>
          <p>
            <strong>4. Verificar flujo:</strong> El sistema debe detectar el código y buscar/crear el producto automáticamente.
          </p>
          <p className="text-muted-foreground italic mt-4">
            Nota: Estos códigos de barras están pre-asignados a los productos de ejemplo en el inventario.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeTestPanel;
