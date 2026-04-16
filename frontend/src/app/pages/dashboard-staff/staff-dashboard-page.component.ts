import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { mockRooms, mockReservations, mockEmployees, currentUser } from '../../data/mockData';

@Component({
  selector: 'app-staff-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './staff-dashboard-page.component.html',
  styleUrls: ['./staff-dashboard-page.component.scss']
})
export class StaffDashboardPageComponent implements OnInit {
  availableRooms = 0;
  occupiedRooms = 0;
  activeReservations = 0;
  totalRevenue = 0;
  occupancyRate = 0;
  
  mockRooms = mockRooms;
  mockReservations = mockReservations;
  mockEmployees = mockEmployees;
  currentUser = currentUser;

  ngOnInit() {
    this.calculateStats();
  }

  calculateStats() {
    this.availableRooms = this.mockRooms.filter((r: any) => r.status === 'available').length;
    this.occupiedRooms = this.mockRooms.filter((r: any) => r.status === 'occupied').length;
    this.activeReservations = this.mockReservations.filter((r: any) => r.status === 'confirmed').length;
    this.totalRevenue = this.mockReservations
      .filter((r: any) => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum: number, r: any) => sum + r.totalPrice, 0);
    this.occupancyRate = Math.round((this.occupiedRooms / this.mockRooms.length) * 100);
  }

  getActiveEmployees() {
    return this.mockEmployees.filter((e: any) => e.status === 'active').slice(0, 3);
  }

  getPendingReservations() {
    return this.mockReservations.filter((r: any) => r.status === 'pending').length;
  }
}