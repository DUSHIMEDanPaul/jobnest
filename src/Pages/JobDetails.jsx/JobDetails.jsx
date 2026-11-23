import { useState } from 'react';
import Modal from '../../Components/Modal/Modal';
import { useLoaderData } from 'react-router-dom';

const JobDetails = () => {
    const job = useLoaderData()
    const { _id, bannerUrl, category, description, loggedInUserInfo, title, postingDate, deadline, salaryRange, applicantsNumber } = job;
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <div className="mx-auto mt-9 max-w-3xl overflow-hidden bg-white rounded-lg shadow-md dark:bg-sky-50">
                <img className="object-cover h-52 max-w-2xl mx-auto" src={bannerUrl} alt={title} />

                <div className="p-6">
                    <div>
                        <span className="text-xs font-medium text-sky-950 uppercase dark:text-sky-950">{category}</span>
                        <h1 className="block mt-2 text-xl font-semibold text-sky-700">{title}</h1>
                        <p className="mt-2 text-sm text-sky-950 dark:text-sky-950">{description}</p>
                        <p className="mt-2 text-sm text-sky-950 dark:text-sky-950">Salary Range: {salaryRange ?? job.salary_range}</p>
                        <p className="mt-2 text-sm text-sky-950 dark:text-sky-950">Applicants: {applicantsNumber}</p>
                    </div>
                    <div className='flex space-x-5'>
                        <p className="mt-2 text-sm text-sky-950 dark:text-sky-950">Posted: {postingDate}</p>
                        <p className="mt-2 text-sm text-sky-950 dark:text-sky-950">Deadline: {deadline}</p>
                    </div>
                </div>

                <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center w-full p-3 font-semibold tracking-wide rounded-md bg-sky-700 text-gray-50">
                    Apply Now
                </button>
            </div>

            {isModalOpen && (
                <Modal
                    onClose={() => setIsModalOpen(false)}
                    deadline={deadline}
                    loggedInUserInfo={loggedInUserInfo}
                    jobId={_id}
                    jobTitle={title}
                />
            )}
        </div>
    );
};

export default JobDetails;
