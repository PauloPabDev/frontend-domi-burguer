import { Location } from "@/types/locations";
import { getApiUrl } from "@/utils/apiUrl";

export class LocationService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  static async getLocationId(id: string): Promise<{ body: Location }> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/locations/${id}`);
      if (!response.ok) {
        throw new Error("Error fetching location");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching location:", error);
      throw error;
    }
  }

  static async getByIdAuthenticated(id: string, token: string): Promise<{ body: Location }> {
    const response = await fetch(`${this.API_URL}api/v2/locations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error fetching location');
    return response.json();
  }

  static async getLocationByIdPublic(id: string): Promise<{ body: Location }> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/locations/public/${id}`);
      if (!response.ok) {
        throw new Error("Error fetching public location");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching public location:", error);
      throw error;
    }
  }

  //add location 
  static async addLocation({ token, location }: { token: string | null, location: object }): Promise<{ body: Location }> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      let url = `${this.API_URL}api/v2/locations/public`;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        url = `${this.API_URL}api/v2/locations`;
      }

      const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(location),
      };


      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error("Error fetching location");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching location:", error);
      throw error;
    }
  }

  static async getUserLocations(token: string): Promise<{ body: [Location] }> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/locations/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching location");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching location:", error);
      throw error;
    }
  }
  static async deleteLocation(token: string, id: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error deleting location");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error;
    }
  }

  static async setFavoriteLocation(token: string, id: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/locations/${id}/favorite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error setting favorite location");
      }
    } catch (error) {
      console.error("Error setting favorite location:", error);
      throw error;
    }
  }


}
