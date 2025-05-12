# CasaSole 3DModel

## Table of Contents

1. Project Title
2. Project Summary
3. Objectives
4. Target Audience
5. Tech Stack
6. Key Features
7. Strecht Features (Future Scope)
8. Milestones
9. Stakeholder
10. Deliverables
11. Live Inspiration
12. Research questions + subquestions
13. Integrating JSON, Excel, and MySQL for 3D Model Data Management
14. Development Software Diagram

## 1. Project Title

CasaSole 3D – An Interactive Web Application for Data Center Design and Visualization

## 2. Project Summary

CasaSole 3D is a web-based application that allows users to visualize, modify, and
customize data center layouts in real-time. Users can add server racks, cooling units,
cables, and infrastructure equipment, rearranging them within a virtual 3D environment
to simulate operational spaces.

## 3. Objectives

- Enable users to design data centers using drag-and-drop 3D models.
- Allow interactive changes like resizing, rotating, and configuring components
    (e.g., rack size, cooling systems).
- Offer export or save functionality for custom layouts and infrastructure planning.
- Keep the interface intuitive for both technical and non-technical users (e.g., IT
    managers, infrastructure engineers).


## 4. Target Audience

- Data center architects
- IT infrastructure engineers
- Facility planners

## 5. Tech Stack

**Layer Tool/Library**
3D Rendering Three.js
Asset Loading GLTFLoader
Camera/Controls OrbitControls, TransformControls
UI Logic Vanilla JS / Vue
Model Storage Local JSON / Firebase (out of scope)
UI Styling Tailwind / CSS

## 6. Key Features

**Feature Description**
3D Room View Base layout with walls and floor
Equipment Gallery Load and display 3D furniture assets
Drag-and-Drop Objects Interact and move furniture within the
space
Rotate/Resize Furniture Transform controls on selected object
Configure components Color picker or swappable materials
Camera Navigation Zoom, pan, orbit
Scene Saving Save/load room designs as JSON

## 7. Stretch Features (Future Scope)

- Heatmap visualization for cooling analysis
- Power consumption simulation
- Multiple data center templates (small/medium/large scale)
- AR view for mobile devices
- User accounts and cloud project storage
- Exporting designs (image, 3D model, or blueprint)


## 8. Milestones

**Sprint 01:**

- Organization of the codebase and GitHub repository structure.
- Initializing a README file with project details, installation instructions.
- Application Web host deployment on Cloudflare

**Sprint 02:**

- Deployment of 3D modeling dynamic storage and related functionalities.
- Setting up a Cloudflare-hosted web application with basic security configurations
    (HTTPS, caching).
- Implementing dynamic 3D model storage using JSON files for real-time model
    configuration.
- Initializing the MySQL database to store persistent 3D model data.
- Integrating Excel data export and import for batch model management.

**Sprint 03:**

- Better user interaction with advanced 3D manipulation (drag, rotate, resize).
- Optimizing Three.js rendering for improved performance, including instancing for
    multiple objects.
- Configuring the save/load functionality for 3D layouts using JSON in MySQL.
- Developing API endpoints for CRUD operations on 3D model data.
- Integrating AR functionality using 8thWall or WebXR with Three.js.
- Allowing users to view their 3D-modeled data center layouts in a real-world
    environment using a mobile device.

**Sprint 04 (Out of Scope / Extras)**

- Implementing user authentication and account management.
- Allowing users to save multiple 3D layouts linked to their accounts.
- Adding user roles (admin, designer, viewer) for better access control.
- Integrating Excel file storage in the database (BLOB or parsed tables).

## 9. Stakeholder

j.chua@fontys.nl

## 10. Deliverables

- Working web application
- GitHub repository with documentation
- User guide or tutorial
- Final report (design decisions, architecture, challenges)


## 11. Live Inspiration

https://www.target.com/planners/home-planner


## 12. Research question

**How can 3D modeling enhance efficiency and organization in Smart Industry
infrastructure, specifically in the design and planning of industrial facilities and
warehouse architectures?**

3D modeling enhances the efficiency of Smart Industry facility and warehouse design by
enabling detailed visualization and analysis before construction begins. It allows
engineers and planners to assess spatial configurations, optimize equipment placement,
and evaluate airflow, energy consumption, and operational flows. Simulating real-world
scenarios in a virtual environment helps identify potential inefficiencies or design flaws
early in the process, reducing costly changes later on. Additionally, 3D models support
better collaboration across teams by providing a clear and shared understanding of the
layout and design, which improves communication and decision-making. Overall, 3D
modeling contributes to more efficient planning, faster implementation, and improved
operational outcomes in industrial environments.

**_Subquestions_**

**What 3D modeling tool or library is most suitable for developing the interactive data
center dashboard?**

```
Three.js is the most suitable due to its lightweight nature, strong community, easy
integration with web features (HTML/JS/CSS), and great support for real-time
interaction.
```
```
How well does Three.js support real-time interaction and large object sets (ex.,
hundreds of servers)?
```
In my experience, Three.js supports real-time interaction efficiently, but performance must
be optimized (for ex., using instanced meshes) when dealing with hundreds of objects.

- **What interaction methods are most effective for configuring data center**
    **layouts?**

Drag-and-drop interfaces, rotation and resizing handles (transform controls), snap-to-grid
options and contextual menus (right-click options). These make layout configuration
intuitive even for users without infrastructure design experience.

- **How can AR integration support physical inspection of virtual designs?**

AR (Augmented Reality) allows users to project a virtual data center layout into a real
environment. This helps in spatial planning, checking clearances, and visualizing pathways
for cabling or airflow in physical space before actual deployment.


**What data storage and retrieval strategies are used for saving and loading 3D data
center layouts?**

The web application integrates JSON, Excel and MySQL to efficiently manage 3D model
data. JSON is used for real-time data storage and manipulation of 3D model attributes
(for example type, position, rotation) in the Three.js environment. Excel serves as a user-
friendly format for data analysis and batch management, allowing users to export JSON
data, make bulk modifications and re-import it into the application. MySQL provides
persistent storage, ensuring that JSON data is saved and accessible, with support for
JSON fields and the option to store Excel files as BLOBs or structured tables.

**AR Tool in the 3D Modeling**

To enhance physical-space planning, an AR (Augmented Reality) viewer will be
integrated into the application using **8thWall** or **WebXR** with **Three.js**. This feature will
allow users to view their 3D-modeled data center layouts directly within a real-world
environment using a mobile device or AR headset.

**How it will work:**

- The 3D layout (created in the main app) is exported in a WebGL/GLTF-
    compatible format.
- The user accesses the AR mode via a mobile web browser.
- The layout is overlaid onto their physical space using camera input, enabling full-
    scale walk-throughs and equipment spacing checks.
- Controls will allow users to reposition, scale, and rotate the entire layout within
    the real environment for alignment.

Oliver. (n.d.). _GitHub - oliver3109/8thwall-vue3-threejs-boilerplate: This template_

_allows you to easily develop 8th wall AR projects using Vue3, Three.js, and Typescript._

GitHub. https://github.com/oliver3109/8thwall-vue3-threejs-boilerplate

Agnihotri, N. (2021, December 15). Fusing 8th Wall and react-three-fiber - Globant -

```
Medium. Medium. https://medium.com/globant/fusing-8th-wall-and-react-three-
```
```
fiber-ac617186c9cd
```

## 13. Integrating JSON, Excel, and MySQL for 3D Model Data Management

**JSON for Structured Data Representation**

JSON serves as the primary format for serializing 3D model attributes, including object
types, positions, rotations, and configurations.

**Excel for Data Manipulation and Analysis**

Excel complements JSON by providing a tabular interface for data analysis and
manipulation. Users can export JSON data to Excel for tasks such as batch editing,
reporting and validation. Tools like Power Query enable the transformation and loading
of JSON data into Excel, allowing for efficient data handling without extensive
programming knowledge.

**MySQL for Persistent Storage**

MySQL, a relational database management system, is used for the persistent storage of
both JSON and Excel data. With native support for JSON data types, MySQL allows for
the storage of complex data structures within relational tables. This enables efficient
querying and indexing of JSON fields. Additionally, Excel files can be stored as BLOBs
given the different data types of the webapp requirements.

**Integration of Data Types**

The integration of JSON, Excel and MySQL is achieved through a combination of data
transformation and synchronization processes. JSON data generated by the application is
stored in MySQL for persistence. When needed, this data can be exported to Excel for
analysis or editing. In the parallel, data from Excel can be imported back into the
application by converting it into JSON format and updating the corresponding records in
MySQL. This parallel / bidirectional flow ensures data consistency across different
formats and platforms.

**Advantages of the combined data types**

- **Flexibility** : Combining JSON, Excel and MySQL allows for dynamic data
    handling.
- **Scalability** : MySQL's architecture supports the scaling of data storage as the
    application's user base grows.
- **Accessibility** : Excel's widespread use and user-friendly interface make data
    accessible to a more analysis-matter UX (User Experience).


**References**

- Payara. (2023, September 27). _How to store JSON in MySQL Database_.
    https://blog.payara.fish/how-to-work-with-mysql-and-json-in-developing-cloud-
    appsblog.payara.fish
- ZappySys. (n.d.). _JSON Connector for MS Excel_.
    https://zappysys.com/api/integration-hub/json-connector/excelZappySys
- Stack Overflow. (2016, June 29). _How to connect Excel to MySQL using JSON_.
    https://stackoverflow.com/questions/38110155/how-to-connect-excel-to-mysql-
    using-jsonStack Overflow

## 14. Development Software Diagram

**15. Project Archive - Github Repository
https://github.com/fzcxvz/mycasasole**


