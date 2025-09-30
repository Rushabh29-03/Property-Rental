import React from 'react'
import { useParams } from 'react-router'

function PreviewProperty() {

  const { pr_id } = useParams();

  console.log(pr_id);
  

  return (
    <>
      <div>
          {pr_id}        
      </div>
    </>
  )
}

export default PreviewProperty