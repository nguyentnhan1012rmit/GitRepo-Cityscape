import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';

export const DependencyBeams = () => {
  const dependencyEdges = useAppStore(state => state.dependencyEdges);
  const showDependencies = useAppStore(state => state.showDependencies);
  
  const lineGeometry = useMemo(() => {
    if (!showDependencies || dependencyEdges.length === 0) return null;

    const points: number[] = [];
    dependencyEdges.forEach(edge => {
      // Source point (top of building)
      points.push(edge.source.x, edge.source.height, edge.source.z);
      
      // Control point for arc
      const midX = (edge.source.x + edge.target.x) / 2;
      const midZ = (edge.source.z + edge.target.z) / 2;
      const dist = Math.sqrt(
        Math.pow(edge.source.x - edge.target.x, 2) + 
        Math.pow(edge.source.z - edge.target.z, 2)
      );
      const midY = Math.max(edge.source.height, edge.target.height) + dist * 0.2 + 5;
      
      points.push(midX, midY, midZ);
      
      // Target point (top of building)
      points.push(edge.target.x, edge.target.height, edge.target.z);
    });

    // We can use a simple line segments geometry, but to make an arc we need a spline
    const arcPoints: number[] = [];
    for (let i = 0; i < points.length; i += 9) {
      const p1 = new THREE.Vector3(points[i], points[i+1], points[i+2]);
      const p2 = new THREE.Vector3(points[i+3], points[i+4], points[i+5]);
      const p3 = new THREE.Vector3(points[i+6], points[i+7], points[i+8]);
      
      const curve = new THREE.QuadraticBezierCurve3(p1, p2, p3);
      const segmentPoints = curve.getPoints(20);
      
      for (let j = 0; j < segmentPoints.length - 1; j++) {
        arcPoints.push(
          segmentPoints[j].x, segmentPoints[j].y, segmentPoints[j].z,
          segmentPoints[j+1].x, segmentPoints[j+1].y, segmentPoints[j+1].z
        );
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(arcPoints, 3));
    return geometry;
  }, [dependencyEdges, showDependencies]);

  if (!showDependencies || !lineGeometry) return null;

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial
        color="#00f0ff"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
};
