import type { ProjectState } from "../models/types";

const STORAGE_KEY = "esp32-local-planner-project";

export function saveProject(project: ProjectState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
}

export function loadProject(): ProjectState | undefined {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as ProjectState;
  } catch {
    return undefined;
  }
}

export function clearSavedProject() {
  localStorage.removeItem(STORAGE_KEY);
}

export function downloadProject(project: ProjectState) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.name || "esp32-project"}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function readProjectFile(file: File): Promise<ProjectState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)) as ProjectState);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
