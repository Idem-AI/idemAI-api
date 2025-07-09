import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Deployment } from '../models/deployment.model';

@Injectable({
  providedIn: 'root'
})
export class DeploymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/deployments`;

  /**
   * Get a deployment by ID
   * @param deploymentId ID of the deployment to retrieve
   * @returns Observable of the Deployment
   */
  getDeploymentById(deploymentId: string): Observable<Deployment> {
    return this.http.get<Deployment>(`${this.apiUrl}/${deploymentId}`);
  }

  /**
   * Get all deployments for a project
   * @param projectId ID of the project
   * @returns Observable of Deployment array
   */
  getDeploymentsByProject(projectId: string): Observable<Deployment[]> {
    return this.http.get<Deployment[]>(`${this.apiUrl}/${projectId}`);
  }
  
  /**
   * Generate Terraform files for a deployment
   * @param projectId Optional project ID for new deployments
   * @param deploymentId Deployment ID for existing deployments
   * @returns Observable of the updated Deployment
   */
  generateDeployment(projectId?: string, deploymentId?: string): Observable<Deployment> {
    return this.http.post<Deployment>(`${this.apiUrl}/generate`, { 
      projectId, 
      deploymentId 
    });
  }
}
