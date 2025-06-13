export interface WebContainerModel {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: 'creating' | 'active' | 'stopped' | 'error';
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    workdirName: string;
    ports?: number[];
    files?: string[];
    url?: string;
  };
  userId: string;
}

export interface CreateWebContainerRequest {
  projectId: string;
  name: string;
  description?: string;
  metadata?: {
    workdirName: string;
    ports?: number[];
    files?: string[];
    url?: string;
  };
}

export interface UpdateWebContainerRequest {
  status?: 'creating' | 'active' | 'stopped' | 'error';
  metadata?: {
    workdirName?: string;
    ports?: number[];
    files?: string[];
    url?: string;
  };
}
