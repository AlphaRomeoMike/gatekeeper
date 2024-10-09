#!/bin/bash

# Directory containing the Kubernetes YAML files
K8S_DIR="./k8"  # Change this to your directory path

# Check if the directory exists
if [ ! -d "$K8S_DIR" ]; then
  echo "Directory $K8S_DIR does not exist."
  exit 1
fi

# Loop through all YAML files in the directory and apply them
for file in "$K8S_DIR"/*.yml; do
  if [ -f "$file" ]; then
    echo "Applying $file..."
    minikube kubectl -- apply -f "$file"
    echo "All resources have been applied."
  else
    echo "No YAML files found in $K8S_DIR."
  fi
done
