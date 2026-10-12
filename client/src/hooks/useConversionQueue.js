import { useState, useRef, useCallback } from 'react';
import { convertImageFile } from '../services/api';

export function useConversionQueue() {
  const [items, setItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const cancelRequestedRef = useRef(false);

  // Add files to the queue
  const addFiles = useCallback((fileList) => {
    const newItems = Array.from(fileList).map(file => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);

      // Attempt to read width/height via HTMLImageElement
      const item = {
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'image/unknown',
        previewUrl,
        width: null,
        height: null,
        status: 'pending', // 'pending' | 'converting' | 'completed' | 'error'
        error: null,
        convertedData: null
      };

      // Extract image dimensions asynchronously
      const img = new Image();
      img.onload = () => {
        setItems(current =>
          current.map(it =>
            it.id === id ? { ...it, width: img.naturalWidth, height: img.naturalHeight } : it
          )
        );
      };
      img.src = previewUrl;

      return item;
    });

    setItems(prev => [...prev, ...newItems]);
  }, []);

  // Remove individual file
  const removeFile = useCallback((id) => {
    setItems(prev => {
      const target = prev.find(item => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(item => item.id !== id);
    });
  }, []);

  // Clear all files
  const clearAll = useCallback(() => {
    setItems(prev => {
      prev.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });
    setIsProcessing(false);
    cancelRequestedRef.current = false;
  }, []);

  // Convert a single item
  const convertSingle = useCallback(async (id, options) => {
    const item = items.find(it => it.id === id);
    if (!item) return;

    setItems(prev =>
      prev.map(it => (it.id === id ? { ...it, status: 'converting', error: null } : it))
    );

    try {
      const convertedData = await convertImageFile(item.file, options);
      setItems(prev =>
        prev.map(it =>
          it.id === id ? { ...it, status: 'completed', convertedData, error: null } : it
        )
      );
      return convertedData;
    } catch (err) {
      setItems(prev =>
        prev.map(it =>
          it.id === id ? { ...it, status: 'error', error: err.message } : it
        )
      );
      throw err;
    }
  }, [items]);

  // Cancel running queue
  const cancelQueue = useCallback(() => {
    cancelRequestedRef.current = true;
    setIsProcessing(false);
  }, []);

  // Convert all pending or errored items with client concurrency
  const convertAll = useCallback(async (options) => {
    const pendingItems = items.filter(it => it.status === 'pending' || it.status === 'error');
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    cancelRequestedRef.current = false;

    // Process with concurrency limit of 3
    const queue = [...pendingItems];
    const concurrency = 3;

    const worker = async () => {
      while (queue.length > 0 && !cancelRequestedRef.current) {
        const item = queue.shift();
        if (!item) break;

        setItems(prev =>
          prev.map(it => (it.id === item.id ? { ...it, status: 'converting', error: null } : it))
        );

        try {
          const convertedData = await convertImageFile(item.file, options);
          setItems(prev =>
            prev.map(it =>
              it.id === item.id ? { ...it, status: 'completed', convertedData, error: null } : it
            )
          );
        } catch (err) {
          setItems(prev =>
            prev.map(it =>
              it.id === item.id ? { ...it, status: 'error', error: err.message } : it
            )
          );
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, pendingItems.length) }, () => worker());
    await Promise.all(workers);

    setIsProcessing(false);
  }, [items]);

  // Calculated statistics
  const stats = {
    totalFiles: items.length,
    completedFiles: items.filter(it => it.status === 'completed').length,
    convertingFiles: items.filter(it => it.status === 'converting').length,
    failedFiles: items.filter(it => it.status === 'error').length,
    pendingFiles: items.filter(it => it.status === 'pending').length,
    totalOriginalBytes: items.reduce((acc, it) => acc + (it.size || 0), 0),
    totalConvertedBytes: items.reduce(
      (acc, it) => acc + (it.convertedData?.convertedSize || 0),
      0
    ),
    convertedOriginalBytes: items.reduce(
      (acc, it) => (it.status === 'completed' ? acc + (it.size || 0) : acc),
      0
    )
  };

  const totalSavedBytes = stats.convertedOriginalBytes - stats.totalConvertedBytes;
  const overallSavingsPercent =
    stats.convertedOriginalBytes > 0
      ? Number(((totalSavedBytes / stats.convertedOriginalBytes) * 100).toFixed(1))
      : 0;

  return {
    items,
    isProcessing,
    addFiles,
    removeFile,
    clearAll,
    convertSingle,
    convertAll,
    cancelQueue,
    stats: {
      ...stats,
      totalSavedBytes,
      overallSavingsPercent
    }
  };
}
