import { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Select from "react-select";
import { format } from "date-fns";
import { BsPlus, BsTrash, BsPencil, BsFileEarmarkDiff } from "react-icons/bs";
import { useForm } from "react-hook-form";

// Firebase
import { useCollectionData } from "react-firebase-hooks/firestore";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseUrl: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
  });
}
const firestore = firebase.firestore();
const auth = firebase.auth();

// const data = require('./sampleData.json')

// const categories = [
//   { id: 0, name: "-- All --" },
//   { id: 1, name: "Food" },
//   { id: 2, name: "Fun" },
//   { id: 3, name: "Transportation" },
// ];
const newCategory = "";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [selectCate, setSelectCate] = useState("");
  const [category, setCategory] = useState();
  const [editCategoryMode, setEditCategoryMode] = useState(false);
  const { register, handleSubmit } = useForm();
  const [showForm, setShowForm] = useState(false);
  const [showCategory, setCategoryForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [newCategory, setNewCategory] = useState({
    id: null,
    name: "",
    createdAt: new Date(),
  });
  const [tempData, setTempData] = useState({
    id: null,
    createdAt: new Date(),
    description: "",
    amount: 0,
    category: categories[0],
  });

  const handleFilterCate = (event) => {
    const { value } = event.target;
    console.log(`Checking Cate ID: `, value);
    setSelectCate(value);
  };

  // Firebase stuff
  const moneyRef = firestore.collection("money");
  const query = moneyRef.orderBy("createdAt", "asc").limitToLast(100);
  const [data] = useCollectionData(query, { idField: "id" });
  const categoryRef = firestore.collection("category");
  const categoryQuery = categoryRef.orderBy("name", "desc");
  const [cate] = useCollectionData(categoryQuery, { idField: "id" });

  console.log("REACT_APP_PROJECT_ID", process.env.REACT_APP_PROJECT_ID);

  // This will be run when 'data' is changed.
  useEffect(() => {
    if (cate) {
      let c = cate.map((d, i) => {
        console.log("cate name", d.name);
        return (
          <JournalRow
            data={d}
            i={i}
            onDeleteClick={handleDeleteCategory}
            onEditClick={handleEditCategoryClick}
          />
        );
      });
      setCategories(c);
    }
  }, [data, cate]);

  const handleCategoryFilterChange = (obj) => {
    console.log("filter", obj);
    if (data) {
      // Guard condition
      let t = 0;
      let filteredData = data.filter(
        (d) => obj.id == 0 || d.category.id == obj.id
      );
      let r = filteredData.map((d, i) => {
        console.log("filter", d);
        t += d.amount;
        return <JournalRow data={d} i={i} />;
      });
      setRecords(r);
      setTotal(t);
    }
  };

  // Handle show category form
  const handleshowCategoryForm = () => setCategoryForm(true);

  const handleCloseCategoryForm = () => {
    setNewCategory({
      newCategory: "",
    });
    setCategoryForm(false);
    setEditCategoryMode(false);
  };

  const onSubmitCategory = async (data) => {
    let prepareData = {
      name: data.name,
      createdAt: new Date(),
    };
    console.log("on submit category", prepareData);
    if (editCategoryMode) {
      await categoryRef
        .doc(newCategory.id)
        .set(prepareData)
        .then(() => console.log("Category has been set"))
        .catch((error) => {
          console.error("Error: ", error);
          alert(error);
        });
    } else {
      await categoryRef
        .add(prepareData)
        .then(() => console.log("New record has been added."))
        .catch((error) => {
          console.error("Errror:", error);
          alert(error);
        });
    }
    handleCloseCategoryForm();
  };

  const handleDeleteCategory = (id) => {
    console.log("handleDeleteClick in Journal", id);
    if (window.confirm("Are you sure to delete this record?"))
      categoryRef.doc(id).delete();
  };

  const handleEditCategoryClick = (data) => {
    let preparedData = {
      id: data.id,
      name: data.name,
      createdAt: new Date(),
    };
    console.log("handleEditClick", preparedData);
    // expect original data type for data.createdAt is Firebase's timestamp
    // convert to JS Date object and put it to the same field
    // if ('toDate' in data.createdAt) // guard, check wther toDate() is available in createdAt object.
    //   data.createdAt = data.createdAt.toDate()

    setNewCategory(preparedData);
    setCategoryForm(true);
    setEditCategoryMode(true);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Category</h1>
          <Button
            className="ml-5 ml-lg-0"
            variant="secondary"
            style={{
              margin: "0%",
              boxShadow: "5px 5px 3px rgba(46, 46, 46, 0.62)",
            }}
            onClick={handleshowCategoryForm}
          >
            <BsFileEarmarkDiff /> Add New Category
          </Button>
        </Col>
      </Row>
      <Table className="mt-2" striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>{categories}</tbody>
      </Table>
      {/* Add new Category */}
      <Modal
        show={showCategory}
        onHide={handleCloseCategoryForm}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <form onSubmit={handleSubmit(onSubmitCategory)}>
          <input
            type="hidden"
            placeholder="ID"
            ref={register}
            name="id"
            id="id"
            defaultValue={tempData.id}
          />
          <Modal.Header closeButton>
            <Modal.Title>
              {" "}
              {editCategoryMode ? "Edit Category" : "Add New Category"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col>
                <label htmlFor="newCategory">New Category</label>
              </Col>
              <Col>
                <input
                  type="text"
                  placeholder="New Category"
                  ref={register}
                  name="name"
                  id="name"
                  defaultValue={newCategory.name}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCategoryForm}>
              Close
            </Button>
            <Button
              variant={editCategoryMode ? "success" : "primary"}
              type="submit"
            >
              {editCategoryMode ? "Update Category" : "Add New Category"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </Container>
  );
}

function JournalRow(props) {
  let d = props.data;
  let i = props.i;
  console.log("JournalRow", d.name);
  return (
    <tr>
      <td>
        <BsTrash onClick={() => props.onDeleteClick(d.id)} />
        <BsPencil onClick={() => props.onEditClick(d)} />
      </td>
      <td>{format(d.createdAt.toDate(), "yyyy-MM-dd")}</td>
      <td>{d.name}</td>
    </tr>
  );
}