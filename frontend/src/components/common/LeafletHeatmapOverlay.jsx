import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { HEATMAP_GRADIENTS } from '../../utils/heatmapUtils.js';

// Ensure global Leaflet instance is set for plugins that depend on window.L
if (typeof window !== 'undefined') {
  window.L = L;
}

export const LeafletHeatmapOverlay = ({
  points = [],
  radius = 30,
  blur = 20,
  maxZoom = 18,
  minOpacity = 0.4,
  maxIntensity = 1.0,
  gradientType = 'standard',
  visible = true
}) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    const setupHeatLayer = async () => {
      try {
        if (typeof window !== 'undefined') {
          window.L = L;
        }

        const getHeatFactory = () => (L && L.heatLayer) || (typeof window !== 'undefined' && window.L && window.L.heatLayer);

        if (!getHeatFactory()) {
          try {
            await import('leaflet.heat');
          } catch (e) {
            console.warn('Could not dynamically import leaflet.heat', e);
          }
        }

        if (isCancelled || !map) return;

        const heatFactory = getHeatFactory();

        // Clean up any prior layer
        if (heatLayerRef.current) {
          try {
            map.removeLayer(heatLayerRef.current);
          } catch (e) {
            // Already detached
          }
          heatLayerRef.current = null;
        }

        if (!visible) return;

        const gradient = HEATMAP_GRADIENTS[gradientType] || HEATMAP_GRADIENTS.standard;

        if (heatFactory) {
          const layer = heatFactory(points, {
            radius: Number(radius) || 30,
            blur: Number(blur) || 20,
            maxZoom: Number(maxZoom) || 18,
            max: Number(maxIntensity) || 1.0,
            minOpacity: Number(minOpacity) || 0.4,
            gradient
          });

          layer.addTo(map);
          heatLayerRef.current = layer;
        } else {
          // Fallback: Canvas-based Heat renderer
          const CanvasHeatLayer = L.Layer.extend({
            onAdd: function (currentMap) {
              this._map = currentMap;
              this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');
              const size = currentMap.getSize();
              this._canvas.width = size.x;
              this._canvas.height = size.y;
              this._canvas.style.position = 'absolute';
              this._canvas.style.top = 0;
              this._canvas.style.left = 0;
              this._canvas.style.pointerEvents = 'none';
              currentMap.getPanes().overlayPane.appendChild(this._canvas);
              currentMap.on('moveend zoomend resize', this._redraw, this);
              this._redraw();
            },
            onRemove: function (currentMap) {
              if (this._canvas && this._canvas.parentNode) {
                this._canvas.parentNode.removeChild(this._canvas);
              }
              currentMap.off('moveend zoomend resize', this._redraw, this);
            },
            setLatLngs: function (newPoints) {
              this._points = newPoints;
              this._redraw();
            },
            _redraw: function () {
              if (!this._canvas || !this._map) return;
              const ctx = this._canvas.getContext('2d');
              const size = this._map.getSize();
              this._canvas.width = size.x;
              this._canvas.height = size.y;
              ctx.clearRect(0, 0, size.x, size.y);

              const pts = this._points || points;
              pts.forEach(([lat, lng, intensity = 0.5]) => {
                const pt = this._map.latLngToContainerPoint([lat, lng]);
                const r = radius * 1.2;
                const radGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
                const alpha = Math.min(0.85, Math.max(0.15, intensity * minOpacity * 1.5));
                radGrad.addColorStop(0, `rgba(239, 68, 68, ${alpha})`);
                radGrad.addColorStop(0.4, `rgba(249, 115, 22, ${alpha * 0.7})`);
                radGrad.addColorStop(0.7, `rgba(234, 179, 8, ${alpha * 0.4})`);
                radGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');

                ctx.fillStyle = radGrad;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
                ctx.fill();
              });
            }
          });

          const fallbackLayer = new CanvasHeatLayer();
          fallbackLayer.addTo(map);
          heatLayerRef.current = fallbackLayer;
        }
      } catch (err) {
        console.error('Error initializing Leaflet Heatmap Layer:', err);
      }
    };

    setupHeatLayer();

    return () => {
      isCancelled = true;
      if (heatLayerRef.current && map) {
        try {
          map.removeLayer(heatLayerRef.current);
        } catch (e) {
          // Detached
        }
        heatLayerRef.current = null;
      }
    };
  }, [map, visible, gradientType]);

  // Update dynamic points without tearing down canvas
  useEffect(() => {
    if (heatLayerRef.current && visible) {
      try {
        heatLayerRef.current.setLatLngs(points);
      } catch (err) {
        console.warn('Could not update heatmap coordinates:', err);
      }
    }
  }, [points, visible]);

  // Update dynamic options
  useEffect(() => {
    if (heatLayerRef.current && visible && typeof heatLayerRef.current.setOptions === 'function') {
      try {
        const gradient = HEATMAP_GRADIENTS[gradientType] || HEATMAP_GRADIENTS.standard;
        heatLayerRef.current.setOptions({
          radius: Number(radius) || 30,
          blur: Number(blur) || 20,
          maxZoom: Number(maxZoom) || 18,
          max: Number(maxIntensity) || 1.0,
          minOpacity: Number(minOpacity) || 0.4,
          gradient
        });
      } catch (err) {
        console.warn('Could not update heatmap options:', err);
      }
    }
  }, [radius, blur, minOpacity, maxIntensity, gradientType, visible]);

  return null;
};
