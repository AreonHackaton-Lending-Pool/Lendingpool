
const Catchboxes = () => {
    const boxDatas = [
        {
            title: "Box 1",
            content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui quisquam earum sequi dolore laborum laboriosam porro, itaque quis dicta autem."
        },
        {
            title: "Box 2",
            content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui quisquam earum sequi dolore laborum laboriosam porro, itaque quis dicta autem."
        },
        {
            title: "Box 3",
            content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui quisquam earum sequi dolore laborum laboriosam porro, itaque quis dicta autem."
        }
    ]
    return (
        <div className="mx-5 my-3 bg-transparent backdrop-blur-md">
            <div className="text-center mb-2">
                <h2 className="text-3xl">Catchphrase</h2>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, at.</p>
            </div>
            <div className="flex gap-5">

                {boxDatas.map((data, index) => (
                    <div key={index} className="bg-transparent text-white border p-4  rounded">
                        <h6 className="text-2xl">{data.title}</h6>
                        <p>{data.content}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Catchboxes