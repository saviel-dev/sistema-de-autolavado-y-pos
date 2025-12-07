import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  IoCloseOutline, 
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoKeypadOutline 
} from 'react-icons/io5';
import { validateBarcode, formatBarcode, normalizeBarcode } from '@/lib/barcodeUtils';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
}

const BarcodeScanner = ({ onScan, onClose, isOpen, title = 'Escanear Código de Barras' }: BarcodeScannerProps) => {
  const [scannedCode, setScannedCode] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when dialog closes
      setScannedCode('');
      setIsValid(null);
      setShowManualInput(false);
      setManualCode('');
      setError('');
      setHasPermission(null);
    }
  }, [isOpen]);

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      const code = result[0].rawValue;
      const normalized = normalizeBarcode(code);
      
      setScannedCode(normalized);
      const valid = validateBarcode(normalized);
      setIsValid(valid);

      if (valid) {
        // Play success sound (optional)
        playBeep();
        
        // Auto-submit after a short delay
        setTimeout(() => {
          onScan(normalized);
          onClose();
        }, 800);
      } else {
        setError('Código de barras inválido. Intente nuevamente o ingrese manualmente.');
      }
    }
  };

  const handleError = (error: any) => {
    console.error('Scanner error:', error);
    if (error?.name === 'NotAllowedError') {
      setError('Permiso de cámara denegado. Por favor, habilite el acceso a la cámara.');
      setHasPermission(false);
    } else if (error?.name === 'NotFoundError') {
      setError('No se encontró ninguna cámara. Use entrada manual.');
      setHasPermission(false);
    } else {
      setError('Error al acceder a la cámara. Intente con entrada manual.');
    }
    setShowManualInput(true);
  };

  const handleManualSubmit = () => {
    const normalized = normalizeBarcode(manualCode);
    
    if (!normalized) {
      setError('Por favor ingrese un código de barras.');
      return;
    }

    const valid = validateBarcode(normalized);
    
    if (valid) {
      onScan(normalized);
      onClose();
    } else {
      setError('Código de barras inválido. Verifique el formato (EAN-13, UPC-A, etc.).');
      setIsValid(false);
    }
  };

  const playBeep = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
          </DialogTitle>
          <DialogDescription>
            {showManualInput 
              ? 'Ingrese el código de barras manualmente'
              : 'Apunte la cámara hacia el código de barras del producto'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showManualInput && hasPermission !== false ? (
            <div className="relative">
              <div className="rounded-lg overflow-hidden bg-black aspect-video">
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  formats={[
                    'ean_13',
                    'ean_8',
                    'upc_a',
                    'upc_e',
                    'code_128',
                    'code_39',
                  ]}
                  components={{
                    audio: false,
                    finder: true,
                  }}
                  styles={{
                    container: {
                      width: '100%',
                      height: '100%',
                    },
                  }}
                />
              </div>

              {/* Scanning overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="border-2 border-primary rounded-lg"
                    style={{ width: '80%', height: '40%' }}
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </div>
              </div>

              {/* Scanned code display */}
              <AnimatePresence>
                {scannedCode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      {isValid ? (
                        <IoCheckmarkCircleOutline className="h-6 w-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <IoAlertCircleOutline className="h-6 w-6 text-destructive flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {isValid ? '✓ Código válido' : '✗ Código inválido'}
                        </p>
                        <p className="text-lg font-mono font-bold truncate">
                          {formatBarcode(scannedCode)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 text-center">
                <IoKeypadOutline className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {error || 'Ingrese el código manualmente'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-barcode">Código de Barras</Label>
                <Input
                  id="manual-barcode"
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value);
                    setError('');
                    setIsValid(null);
                  }}
                  placeholder="Ej: 7501234567890"
                  className="font-mono text-lg"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleManualSubmit();
                    }
                  }}
                />
                {isValid === false && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <IoAlertCircleOutline className="h-4 w-4" />
                    Código inválido
                  </p>
                )}
              </div>
            </div>
          )}

          {error && !showManualInput && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive flex items-center gap-2">
                <IoAlertCircleOutline className="h-4 w-4 flex-shrink-0" />
                {error}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!showManualInput && hasPermission !== false && (
            <Button
              variant="outline"
              onClick={() => setShowManualInput(true)}
              className="gap-2"
            >
              <IoKeypadOutline className="h-4 w-4" />
              Entrada Manual
            </Button>
          )}
          
          {showManualInput && hasPermission !== false && (
            <Button
              variant="outline"
              onClick={() => {
                setShowManualInput(false);
                setManualCode('');
                setError('');
                setIsValid(null);
              }}
              className="gap-2"
            >
              Volver a Escanear
            </Button>
          )}

          {showManualInput ? (
            <Button onClick={handleManualSubmit}>
              Confirmar Código
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              <IoCloseOutline className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
