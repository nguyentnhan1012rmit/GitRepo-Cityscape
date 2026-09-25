import { BuildingBlock } from '@/types';
import * as THREE from 'three';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

export const exportCityToOBJ = (repoData: BuildingBlock[]) => {
  // Construct a temporary group with standard meshes instead of InstancedMesh
  const group = new THREE.Group();

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  
  repoData.forEach((block) => {
    // Only export actual buildings, ignore ground/tree nodes if they have tiny height
    if (block.height <= 0.5 && block.type === 'tree') return;

    const material = new THREE.MeshBasicMaterial({ color: block.color });
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.set(block.x, block.height / 2, block.z);
    mesh.scale.set(block.width, block.height, block.depth);
    
    mesh.name = block.name;
    
    group.add(mesh);
  });

  const exporter = new OBJExporter();
  const result = exporter.parse(group);

  // Trigger download
  const blob = new Blob([result], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = 'gitrepo_cityscape.obj';
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const takeHighResScreenshot = () => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return;

  const url = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = `cityscape_screenshot_${new Date().getTime()}.png`;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
};
