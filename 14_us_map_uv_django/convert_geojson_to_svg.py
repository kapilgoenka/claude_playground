#!/usr/bin/env python3
"""
Convert GeoJSON to SVG paths for US states map
"""
import json
import sys

def lonlat_to_xy(lon, lat, bounds):
    """Convert longitude/latitude to SVG x/y coordinates"""
    # SVG viewBox dimensions
    width = 960
    height = 600

    # Calculate the aspect ratio
    lon_range = bounds['max_lon'] - bounds['min_lon']
    lat_range = bounds['max_lat'] - bounds['min_lat']

    # Scale to fit within viewBox with padding
    padding = 0
    scale = min((width - 2 * padding) / lon_range, (height - 2 * padding) / lat_range)

    # Reduce map size to 70% of available space
    scale = scale * 0.70

    # Calculate actual dimensions with this scale
    actual_width = lon_range * scale
    actual_height = lat_range * scale

    # Center the map in the viewBox
    x_offset = (width - actual_width) / 2
    y_offset = (height - actual_height) / 2

    # Convert coordinates
    x = (lon - bounds['min_lon']) * scale + x_offset
    y = (bounds['max_lat'] - lat) * scale + y_offset  # Flip Y axis

    return x, y

def get_bounds(features):
    """Get min/max bounds for all features (excluding Alaska and Hawaii for main map)"""
    min_lon = float('inf')
    max_lon = float('-inf')
    min_lat = float('inf')
    max_lat = float('-inf')

    # Non-mainland territories and states to exclude
    excluded = ['Alaska', 'Hawaii', 'Puerto Rico', 'District of Columbia']

    for feature in features:
        # Skip non-mainland states and territories
        name = feature['properties']['NAME']
        if name in excluded:
            continue

        coords = feature['geometry']['coordinates']
        geom_type = feature['geometry']['type']

        if geom_type == 'Polygon':
            coords = [coords]

        for polygon in coords:
            for ring in polygon:
                for lon, lat in ring:
                    min_lon = min(min_lon, lon)
                    max_lon = max(max_lon, lon)
                    min_lat = min(min_lat, lat)
                    max_lat = max(max_lat, lat)

    return {
        'min_lon': min_lon,
        'max_lon': max_lon,
        'min_lat': min_lat,
        'max_lat': max_lat
    }

def get_polygon_area(ring):
    """Calculate approximate area of a polygon ring using Shoelace formula"""
    if len(ring) < 3:
        return 0
    area = 0
    for i in range(len(ring)):
        j = (i + 1) % len(ring)
        area += ring[i][0] * ring[j][1]
        area -= ring[j][0] * ring[i][1]
    return abs(area) / 2

def coords_to_path(coordinates, geom_type, bounds, min_area_threshold=0.01):
    """Convert GeoJSON coordinates to SVG path, filtering out small islands"""
    paths = []

    if geom_type == 'Polygon':
        coordinates = [coordinates]

    for polygon in coordinates:
        for ring_idx, ring in enumerate(polygon):
            # Filter out small islands (likely offshore islands)
            # Only apply to outer rings (ring_idx == 0)
            if ring_idx == 0:
                area = get_polygon_area(ring)
                if area < min_area_threshold:
                    continue

            path_parts = []
            for idx, (lon, lat) in enumerate(ring):
                x, y = lonlat_to_xy(lon, lat, bounds)
                if idx == 0:
                    path_parts.append(f"M {x:.2f} {y:.2f}")
                else:
                    path_parts.append(f"L {x:.2f} {y:.2f}")
            path_parts.append("Z")
            paths.append(" ".join(path_parts))

    return " ".join(paths)

def scale_and_translate_coords(coordinates, geom_type, scale_factor, translate_x, translate_y):
    """Scale and translate coordinates for Alaska and Hawaii"""
    paths = []

    if geom_type == 'Polygon':
        coordinates = [coordinates]

    for polygon in coordinates:
        for ring in polygon:
            path_parts = []
            for idx, (lon, lat) in enumerate(ring):
                x = lon * scale_factor + translate_x
                y = lat * scale_factor + translate_y
                if idx == 0:
                    path_parts.append(f"M {x:.2f} {y:.2f}")
                else:
                    path_parts.append(f"L {x:.2f} {y:.2f}")
            path_parts.append("Z")
            paths.append(" ".join(path_parts))

    return " ".join(paths)

def main():
    # Load GeoJSON file
    with open('/tmp/us-states.json', 'r') as f:
        data = json.load(f)

    features = data['features']

    # Get bounds for continental states only
    bounds = get_bounds(features)
    print(f"Continental US Bounds: {bounds}", file=sys.stderr)

    # Convert each state (excluding non-mainland territories and islands)
    excluded = ['Alaska', 'Hawaii', 'Puerto Rico', 'District of Columbia']
    states = []
    for feature in features:
        name = feature['properties']['NAME']

        # Skip non-mainland states and territories
        if name in excluded:
            continue

        geom_type = feature['geometry']['type']
        coords = feature['geometry']['coordinates']

        # Convert to SVG path using continental bounds, filtering small islands
        path = coords_to_path(coords, geom_type, bounds, min_area_threshold=0.01)

        # Skip if no valid paths were generated (all islands were too small)
        if not path.strip():
            continue

        # Get state abbreviation
        state_abbr = get_state_abbr(name)

        states.append({
            'name': name,
            'abbr': state_abbr,
            'path': path
        })

    # Sort by name
    states.sort(key=lambda x: x['name'])

    # Output JavaScript
    print("// US States data with accurate SVG paths from US Census Bureau")
    print("// Generated from 2010 Census Cartographic Boundary Files (20m resolution)")
    print()
    print("const US_STATES = [")

    for idx, state in enumerate(states):
        comma = "," if idx < len(states) - 1 else ""
        # Escape any special characters in the path
        path_escaped = state['path'].replace('"', '\\"')
        print(f'    {{ name: "{state["name"]}", abbr: "{state["abbr"]}", path: "{path_escaped}" }}{comma}')

    print("];")

def get_state_abbr(name):
    """Map state name to abbreviation"""
    abbr_map = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
        'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
        'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
        'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
        'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
        'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
        'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
        'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
        'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
        'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
        'Wisconsin': 'WI', 'Wyoming': 'WY'
    }
    return abbr_map.get(name, 'XX')

if __name__ == '__main__':
    main()
