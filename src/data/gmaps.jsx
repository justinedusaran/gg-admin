import React from "react";

const GoogleMap = () => {
  const place = "NCR";

  const getCoordinates = (location) => {
    let coordinates = { latitude: 0, longitude: 0 };

    if (location === "NCR") {
      coordinates = { latitude: 14.6091, longitude: 121.0223 };
    }

    return coordinates;
  };

  const coordinates = getCoordinates(place);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div className="mapouter" style={{ marginBottom: "0px", width: "100%" }}>
        <div className="gmap_canvas">
          <iframe
            src="https://maps.google.com/maps?q=ncr&amp;t=&amp;z=10&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
            frameBorder="1"
            title="Google Map"
            style={{
              border: "0.1px solid #3d3d3d",
              borderRadius: "8px",
              width: "100%",
              height: "485px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export { GoogleMap };
