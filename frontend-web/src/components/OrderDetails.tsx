import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from './ui/badge';
import {CheckCircle, Link, Map} from 'lucide-react';
import Order from '@/models/order';
import { Button } from './ui/button';

interface OrderDetails {
  accessToken: string;
  startCoordinates: [number, number];
  endCoordinates: [number, number];
  className?: string;
  order:Order;
}

interface Route {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
}

const OrderDetails = ({
  accessToken,
  startCoordinates,
  endCoordinates,
  className = 'w-full h-96',
  order
} : OrderDetails) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [route, setRoute] = useState<Route | null>(null);


  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: startCoordinates,
      zoom: 13
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for start and end points
    new mapboxgl.Marker({ color: '#FF0000' })
      .setLngLat(startCoordinates)
      .addTo(map.current);

    new mapboxgl.Marker({ color: '#FF0000' })
      .setLngLat(endCoordinates)
      .addTo(map.current);

    // Fetch route
    const fetchRoute = async () => {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${startCoordinates[0]},${startCoordinates[1]};${endCoordinates[0]},${endCoordinates[1]}` +
        `?steps=true&geometries=geojson&access_token=${accessToken}`,
        { method: 'GET' }
      );
      const json = await query.json();
      const data = json.routes[0];
      setRoute(data);

      // Add route to map
      if (map.current?.getSource('route')) {
        (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: data.geometry.coordinates
          }
        });
      } else {
        map.current?.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: data.geometry.coordinates
              }
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#1832db',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }
    };

    fetchRoute();

    return () => {
      map.current?.remove();
    };
  }, [accessToken, startCoordinates, endCoordinates]);

  async function onCopyMapsLinkClick() {
    const link:string = getGoogleMapsUrl(startCoordinates[1], startCoordinates[0], endCoordinates[1], endCoordinates[0]);
    await navigator.clipboard.writeText(link);
    alert('Copied to clipboard!');
  }

  function onLaunchMapsClick() {
    const link:string = getGoogleMapsUrl(startCoordinates[1], startCoordinates[0], endCoordinates[1], endCoordinates[0]);
    window.open(link, '_blank');
  }

  function handleMarkAsDelivered() {
    markAsDelivered(order.id);
  }

  return (
    <div className='flex flex-row gap-4'>
    <div className="flex flex-col justify-center gap-1">
      <div ref={mapContainer} className={className} />
      <div className={`p-4 bg-white rounded w-full gap-4 flex flex-row`}>
          <Badge 
                variant={'secondary'} 
                onClick={onLaunchMapsClick}
                className='bg-primary p-2 flex-1 hover:bg-primary cursor-pointer flex items-center justify-center'
              >
            <Map className="h-5 w-5 text-white" />
            <span className="ml-2 text-white">Launch Maps</span>
          </Badge>
          <Badge 
                variant={'secondary'} 
                onClick={onCopyMapsLinkClick}
                className='bg-primary p-2 flex-1 hover:bg-primary cursor-pointer flex items-center justify-center'
              >
            <Link className="h-5 w-5 text-white" />
            <span className="ml-2 text-white">Copy Maps Link</span>
          </Badge>
      </div>
    </div>
    <div className="flex flex-col gap-4">
      <div className="bg-white p-4 rounded">
        <h3 className="text-lg font-semibold">Order Details</h3>
        <p className="text-sm text-muted-foreground">Customer Name: {order.customerName}</p>
        <p className="text-sm text-muted-foreground">Earning: {order.deliveryFees} ETH</p>
        <p className="text-sm text-muted-foreground">Delivery Address: {order.deliveryAddress}</p>
        <p className="text-sm text-muted-foreground">Order Content: {order.content}</p>
        <p className="text-sm text-muted-foreground">Order Description: {order.description}</p>
      </div>
      <div className="bg-white p-4 rounded">
        <h3 className="text-lg font-semibold">Route Details</h3>
        <p className="text-sm text-muted-foreground">Distance: {route ? `${(route.distance / 1000).toFixed(2)} km` : 'Calculating...'}</p>
        <p className="text-sm text-muted-foreground">Duration: {route ? `${(route.duration / 60).toFixed(2)} minutes` : 'Calculating...'}</p>
      </div>
    <Button size="sm" className='text-white rounded-full font-semibold bg-primary' onClick={handleMarkAsDelivered}>
        <CheckCircle className="h-5 w-5 text-white" />
        Mark as Delivered
    </Button>
    </div>
    </div>
  );
};

function getGoogleMapsUrl(startLat: number, startLng: number, endLat: number, endLng: number, travelMode: string = 'driving'): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${endLat},${endLng}&travelmode=${travelMode}`;
}

export default OrderDetails;