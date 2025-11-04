import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { CarParkData } from './types';

interface CarParkSearchProps {
  data: CarParkData[];
  onCarParkSelect: (carPark: CarParkData) => void;
}

export const CarParkSearch: React.FC<CarParkSearchProps> = ({ data, onCarParkSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter car parks based on search term
  const filteredCarParks = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return data
      .filter(carPark => 
        carPark.info.car_park_no.toLowerCase().includes(term) ||
        carPark.info.address.toLowerCase().includes(term)
      )
      .slice(0, 10); // Limit to 10 results for performance
  }, [data, searchTerm]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(value.trim().length > 0);
    setSelectedIndex(-1);
  };

  // Handle car park selection
  const handleCarParkSelect = (carPark: CarParkData) => {
    setSearchTerm(`${carPark.info.car_park_no} - ${carPark.info.address}`);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    onCarParkSelect(carPark);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || filteredCarParks.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCarParks.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredCarParks.length) {
          handleCarParkSelect(filteredCarParks[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search
  const handleClear = () => {
    setSearchTerm('');
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="carpark-search" ref={searchRef}>
      <div className="carpark-search-input-container">
        <input
          type="text"
          placeholder="Search car park by code or address..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.trim() && setIsDropdownOpen(true)}
          className="carpark-search-input"
        />
        {searchTerm ? (
          <button
            onClick={handleClear}
            className="carpark-search-clear"
            type="button"
          >
            ×
          </button> 
        ): 
        <div className="carpark-search-icon">
        🔍
      </div>}

      </div>

      {isDropdownOpen && filteredCarParks.length > 0 && (
        <div className="carpark-search-dropdown">
          {filteredCarParks.map((carPark, index) => (
            <div
              key={carPark.info.car_park_no}
              className={`carpark-search-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleCarParkSelect(carPark)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="carpark-search-item-code">
                {carPark.info.car_park_no}
              </div>
              <div className="carpark-search-item-address">
                {carPark.info.address}
              </div>
              {carPark.availability && (
                <div className="carpark-search-item-availability">
                  {carPark.availability.carpark_info
                    .reduce((total, info) => total + parseInt(info.lots_available), 0)} available
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isDropdownOpen && searchTerm.trim() && filteredCarParks.length === 0 && (
        <div className="carpark-search-dropdown">
          <div className="carpark-search-no-results">
            No car parks found for "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};